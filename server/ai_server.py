from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from typing import List

app = FastAPI(title='English Fantasy AI Server')

# Local storage paths
STORE_DIR = os.path.join(os.path.dirname(__file__), 'vector_store')

# Request/Response models
class QueryRequest(BaseModel):
    query: str

class IngestResponse(BaseModel):
    documents_indexed: int


@app.get('/')
async def root():
    return {'status': 'ok', 'note': 'AI server for English Fantasy. Use /ingest and /query endpoints.'}


@app.post('/ingest', response_model=IngestResponse)
async def ingest():
    """Load game documents and build a FAISS vector store with embeddings."""
    try:
        from ai_utils import load_game_documents
        from langchain.schema import Document
        from langchain.embeddings import SentenceTransformerEmbeddings
        from langchain.vectorstores import FAISS
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Missing dependency or import error: {e}')

    documents = load_game_documents()
    if not documents:
        return {'documents_indexed': 0}

    docs = [Document(page_content=d['text'], metadata={'id': d['id']}) for d in documents]

    embeddings = SentenceTransformerEmbeddings(model_name='all-MiniLM-L6-v2')
    store = FAISS.from_documents(docs, embeddings)

    os.makedirs(STORE_DIR, exist_ok=True)
    store.save_local(STORE_DIR)

    return {'documents_indexed': len(docs)}


@app.post('/query')
async def query(request: QueryRequest):
    """Perform a RAG query: retrieve relevant docs and call LLM to generate an answer."""
    try:
        from langchain.vectorstores import FAISS
        from langchain.embeddings import SentenceTransformerEmbeddings
        from langchain.llms import OpenAI
        from langchain.chains import LLMChain
        from langchain.prompts import PromptTemplate
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Missing dependency or import error: {e}')

    if not os.path.isdir(STORE_DIR):
        raise HTTPException(status_code=400, detail='Vector store not found. Call /ingest first.')

    embeddings = SentenceTransformerEmbeddings(model_name='all-MiniLM-L6-v2')
    store = FAISS.load_local(STORE_DIR, embeddings)
    retriever = store.as_retriever(search_kwargs={'k': 5})

    # retrieve
    results = retriever.get_relevant_documents(request.query)
    context = '\n\n'.join([f"[{d.metadata.get('id')}]: {d.page_content}" for d in results])

    # build prompt
    template = (
        "You are an English Fantasy game assistant. Use the game context below to answer the player's question.\n\n"
        "{context}\n\nPlayer question: {question}\n\nAnswer:"
    )
    prompt = PromptTemplate(template=template, input_variables=['context', 'question'])

    # choose LLM - requires OPENAI_API_KEY in env
    llm = None
    if os.getenv('OPENAI_API_KEY'):
        llm = OpenAI(temperature=0.2)
    
    if llm:
        chain = LLMChain(llm=llm, prompt=prompt)
        resp = chain.run({'context': context or 'No context found', 'question': request.query})
        return {'answer': resp, 'source_count': len(results)}
    else:
        # fallback: simple rule-based reply using retrieved context
        combined = f"Context:\n{context}\n\nQuestion:\n{request.query}"
        return {'answer': '[Local fallback] ' + combined, 'source_count': len(results)}
