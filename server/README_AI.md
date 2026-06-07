English Fantasy — AI Backend (RAG + LangChain + Agent)

This small FastAPI service demonstrates a Python backend that implements:
- Document ingestion from `src/assets/data/` into a FAISS vector store
- RAG-style retrieval + LLM generation using LangChain
- A simple agent interface to query the game knowledge

Quick start (Windows / Unix):

1. Create a virtual environment and install deps

```bash
python -m venv .venv
# activate: Windows: .\.venv\Scripts\Activate.ps1  or .venv\Scripts\activate
pip install -r requirements.txt
```

2. (Optional) Add your OpenAI API key to `.env` or the environment

```bash
# Copy the example
copy .env.example .env   # Windows
# Edit .env and set OPENAI_API_KEY=sk-...
```

3. Ingest game documents into a local FAISS store

```bash
uvicorn ai_server:app --reload --port 8001
# Then in another terminal:
curl -X POST http://localhost:8001/ingest
```

4. Query the agent

```bash
curl -X POST http://localhost:8001/query -H "Content-Type: application/json" -d '{"query":"What is a boss?"}'
```

Notes:
- This is a prototype. For production you should:
  - Add paging, error handling, and authentication
  - Move embeddings/FAISS to a persistent datastore
  - Protect your OpenAI key and limit access
- If you don't set `OPENAI_API_KEY`, the server will return a fallback response containing retrieved context.
