# L.I.G.H.T (Legal Innovation & Government Help Tool)
<div align="center">
  
  <h3>The Intelligent AI Kiosk Swarm for Civic & Legal Access</h3>

  [![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue.svg)](https://react.dev/)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
  [![AI](https://img.shields.io/badge/AI-LangGraph%20%7C%20Llama%203-FF9900.svg)]()
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

<hr>

## 📖 The Problem: The Accessibility Fracture
The interaction between the Indian state and its citizens is fundamentally broken by barriers of language, process complexity, and digital literacy.

*   **The Civic Divide:** Millions are forced to pay exploitative "touts" just to fill out complex, English-heavy PDFs for basic services like Aadhaar updates because they cannot navigate digital portals.
*   **The Legal Labyrinth:** When served a legal notice or facing a domestic dispute, citizens are thrust into an intimidating system. Ignorant of the IPC/BNS and unable to afford counsel, they abandon their pursuit of justice.

## 🚀 The Solution: LIGHT
**LIGHT (Legal Innovation and Government Help Tool)** is an empathetic, decentralized fleet of physical, AI-powered Kiosks (The Swarm). 

The citizen brings nothing but their voice. A multimodal Agent Swarm actively listens in their mother tongue (Malayalam, Hindi, etc.), translates complex bureaucratic requirements into simple steps, guarantees deterministic legal accuracy via Vector-Search (ChromaDB), and automatically reads IDs and plots pixel-perfect Govt PDF forms via OCR at the edge.

---

## 🔥 Key Features & USP
*   **🗣️ Voice Universality:** Bilingual TTS & Whisper transcription eliminates the language barrier (specifically tailored for Malayalam and English).
*   **🧠 Swarm Intelligence (LangGraph):** Tasks are seamlessly handed off between specialized micro-agents (*Vision Agent, Legal Retriever, Form Plotter*).
*   **⚖️ Deterministic Legal Integrity (RAG):** Answers are grounded strictly in BNS/IPC texts secured within ChromaDB—*zero hallucination allowed*.
*   **📄 Edge Document Assembly:** Uses PaddleOCR to read IDs locally and Python `fpdf2` to automatically assemble printed Government PDFs.
*   **📲 Total Privacy (QR Handoff):** The filled form is handed off locally via a QR code. The session data is then instantly and physically scrubbed from the Kiosk memory.

---

## 🛠️ Tech Stack Architecture
The system is built on a highly concurrent, fully decoupled architecture designed to prevent heavy Machine Learning tasks from crashing the primary web server.

### Frontend (Kiosk Client)
*   **React + Vite + TailwindCSS:** Optimized for an unbreakable fullscreen Kiosk-mode OS environment.
*   **Web Speech API:** For real-time voice dictation.

### Backend (The Swarm Engine)
*   **FastAPI:** Asynchronous API routing to handle high concurrent kiosk connections.
*   **LangGraph + MCP:** Stateful execution graph to define agent routing and tool schemas.
*   **Redis & Celery Queue:** Background worker queues that isolate heavy ML loads (PaddleOCR) from crashing the FastAPI event loop.
*   **ChromaDB:** Local Vector database for dense RAG legal embeddings.
*   **APScheduler:** Background CRON jobs automatically fetching daily civic/procedure updates.

### AI & Machine Learning
*   **LLM Engine:** Groq API (Llama 3 70B/8B) for high-speed logic routing and translation.
*   **Vision Models:** Local Llama 3.2 Vision via Ollama (fallback to Groq Vision).
*   **Speech-to-Text / Text-to-Speech:** Whisper & native `edge-tts`.

---

## ⚙️ Installation & Deployment
LIGHT is designed to be deployed using isolated processes for maximum stability.

### Prerequisites
* Python 3.10+
* Node.js v18+
* Redis Server (`docker run -d -p 6379:6379 redis`)

### 1. Setup Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

Set up your `.env` file in the `backend` directory:
```env
GROQ_API_KEY="your_groq_key_here"
```

### 2. Run the Swarm Services
You must run the highly decoupled services in separate terminal windows:

**Terminal 1 (FastAPI Server):**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 (Celery Heavy ML Workers):**
*Note: We limit concurrency to prevent PaddleOCR from causing Out-Of-Memory (OOM) errors.*
```bash
# Windows
celery -A app.services.job_queue.celery_app worker -l info -P solo

# Linux
celery -A app.services.job_queue.celery_app worker --loglevel=info --concurrency=1
```

### 3. Start Kiosk Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Security & Guardrails
LIGHT implements strict **NeMo Guardrails** as a deterministic "Ethics Veto." Before any LLM processing occurs, an InputFilter regex and embedding check assesses the payload for adversarial prompt-injection or abusive language. Failing the check triggers an immediate, non-LLM safety fallback.

## 🤝 Future Scaling (India Stack)
The Swarm is being architected for direct API assimilation with:
1.  **DigiLocker:** For paperless, zero-OCR KYC and verified document pulling at the Kiosk.
2.  **UPI:** For instantaneous, integrated Government fee payments natively on-screen.

---
