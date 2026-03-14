import os
from groq import Groq
from dotenv import load_dotenv

# Robust .env loading
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)

class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        self.client = Groq(api_key=self.api_key, timeout=30.0) # 30s timeout to prevent uvicorn hangs
        self.model = "llama-3.1-8b-instant" # Production-ready reliable model

    def get_completion(self, prompt, system_prompt="You are a helpful assistant.", temperature=0.0, model=None, max_tokens=1024, json_mode=False, base64_image=None):
        import time
        max_retries = 3
        retry_delay = 1
        
        # Override model if vision is requested
        target_model = "meta-llama/llama-4-scout-17b-16e-instruct" if base64_image else (model or self.model)
        
        for attempt in range(max_retries):
            try:
                # Construct message payload
                messages = []
                if base64_image:
                    # Vision models often don't support a separate 'system' role in the same way
                    # Merge system instructions into the user prompt
                    merged_prompt = f"{system_prompt}\n\nUser Question: {prompt}"
                    user_content = [
                        {"type": "text", "text": merged_prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                    messages = [{"role": "user", "content": user_content}]
                else:
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ]

                kwargs = {
                    "messages": messages,
                    "model": target_model,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if json_mode and not base64_image: # Vision models typically don't support forced JSON mode
                    kwargs["response_format"] = {"type": "json_object"}
                    
                chat_completion = self.client.chat.completions.create(**kwargs)
                
                if not chat_completion or not hasattr(chat_completion, 'choices') or not chat_completion.choices:
                    print(f"Groq API Error: No choices in response (Model: {target_model}, Attempt {attempt + 1})")
                    continue
                    
                return chat_completion.choices[0].message.content
            except Exception as e:
                error_msg = str(e).lower()
                if "rate_limit" in error_msg or "429" in error_msg:
                    print(f"Groq Rate Limit Hit ({target_model}) - Attempt {attempt + 1}: Retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                
                print(f"Groq API Error ({target_model}): {e}")
                return None
        return None

if __name__ == "__main__":
    client = GroqClient()
    response = client.get_completion("Hello, are you working?")
    print(response)
