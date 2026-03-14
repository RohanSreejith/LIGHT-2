# L.I.G.H.T (Legal Innovation & Government Help Tool) - Production Architecture

The system has been fully refactored for production-grade robustness.

## Architecture & Data Flow

This system uses a distributed event-driven architecture to ensure heavy machine-learning NLP/OCR tasks do not crash the primary API event loop. 

1. **FastAPI (`backend/app/main.py`)**: The core entry point, routing asynchronous HTTP traffic. Runs purely concurrent non-blocking tasks.
2. **LangGraph State (`backend/app/agents/langgraph_pipeline.py`)**: A deterministic execution graph orchestrating security filtering and logic, with SQLite-backed checkpoint state mapping.
3. **ChromaDB (`backend/app/services/vector_store.py`)**: A local vector database containing dense embeddings (SentenceTransformers) for accurate legal search querying.
4. **Celery Worker (`backend/app/workers/ocr_worker.py`)**: A **critical** dedicated worker queue layer. PaddleOCR is a heavy ~500MB+ Machine Learning model that maxes out CPU. We load it *only* inside the isolated Celery worker process, preventing global memory crashes limits on Uvicorn.
5. **Redis Queue**: The message broker linking FastAPI and Celery.
6. **APScheduler**: Fired within the FastAPI lifespan to ingest automated civic data every night.
7. **Model Context Protocol (MCP)**: Server wrapper exposing the backend functions logically.

## Quick Start (Pre-indexed)

The core legal knowledge (IPC, BSA, and Case Law metadata) is pre-indexed in this repository (~200MB). New developers do not need to download the full 5GB datasets to get started.

1. **Clone and Install Dependencies**:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/Scripts/activate  # Windows: .\venv\Scripts\activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure Environment**:
   Copy `backend/.env.example` to `backend/.env` and add your `GROQ_API_KEY`.

3. **Start Services**:
   Follow the production instructions below to start Redis and the FastAPI server.

## Data Management & Growth

Summary: This repository includes a pre-calculated ChromaDB vector store.
- **`backend/app/data/chroma_db`**: Contains the dense embeddings for legal search.
- **Large Files**: The 48,000+ Case Law PDFs (5GB) are excluded from this repository and must be managed separately if re-indexing is required.
