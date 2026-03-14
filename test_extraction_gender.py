import os
import sys

# Ensure backend modules can be imported
sys.path.append(os.path.abspath('backend'))

from app.llm.groq_client import GroqClient
from app.services.form_definitions import FORM_FIELDS
from app.utils.json_cleaner import parse_json_safely

import re

fields = FORM_FIELDS["dl"]
clean_fields = []
for f in fields:
    clean_label = re.sub(r"\(.*?\)", "", f["label"]).strip()
    clean_fields.append(f'  "{f["id"]}": "{clean_label}"')
field_list_str = "\n".join(clean_fields)

last_question = "Gender (Male / Female / Transgender)"
user_input = "asdlkfj asdfk;kj"

extract_prompt = f"""
You are a precise data extraction AI for the Driving Licence Correction Form.
Your job is to read the user's LATEST message and extract ONLY newly provided form fields.

ASSISTANT'S LAST QUESTION TO USER:
{last_question}

USER'S LATEST MESSAGE:
{user_input}

AVAILABLE FIELDS AND THEIR DESCRIPTIONS (id: description):
{field_list_str}

RULES:
1. Output ONLY valid JSON containing ONLY the newly extracted fields matching the keys above.
2. CRITICAL: Map single-word answers directly to the Assistant's last question.
3. If the user simply says "hi", or makes a generic request, MUST return EXACTLY EMPTY JSON object: {{}}
4. If a user explicitly says they want to skip a field (e.g. "skip", "none"), extract it as "SKIP".
5. DO NOT hallucinate. You MUST OMIT any keys from the JSON for fields that were NOT explicitly mentioned.
"""

llm = GroqClient()
raw = llm.get_completion(extract_prompt, system_prompt="You are a precise JSON extraction assistant. Return only valid JSON.", json_mode=True)
print("RAW RESPONSE:")
print(raw)
