# backend/ingest.py
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from backend.config import embeddings, VECTOR_PATH


import os
import shutil
import time


def ingest_pdf(file_path: str, session_id: str):
    try:
        total_start = time.time()
        print(f"\n[INGEST] Starting ingestion for session: {session_id}")
        print(f"[INGEST] File path: {file_path}")

        # Load PDF
        if not os.path.exists(file_path):
            print(f"[INGEST] ERROR: File not found at {file_path}")
            return

        print("[INGEST] Loading PDF...")
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        print(f"[INGEST] Loaded {len(docs)} pages")

        # Split into chunks
        print("[INGEST] Splitting into chunks...")
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150
        )
        chunks = splitter.split_documents(docs)
        print(f"[INGEST] Created {len(chunks)} chunks")

        # Ensure base vectorstore directory exists
        os.makedirs(VECTOR_PATH, exist_ok=True)
        session_path = os.path.join(VECTOR_PATH, session_id)

        if os.path.exists(session_path):
            shutil.rmtree(session_path)

        # -------- EMBEDDING --------
        print("[INGEST] Generating embeddings (this may take a while on CPU)...")
        embed_start = time.time()
        
        texts = [c.page_content for c in chunks]
        metadatas = [c.metadata for c in chunks]

        db = FAISS.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas
        )
        print(f"[INGEST] Embedding + FAISS time: {round(time.time() - embed_start, 2)} seconds")

        print(f"[INGEST] Saving FAISS index to {session_path}...")
        db.save_local(session_path)

        print(f"[INGEST] TOTAL ingestion time: {round(time.time() - total_start, 2)} seconds")
        print(f"[INGEST] SUCCESS: Indexed {len(chunks)} chunks for session {session_id}\n")
    except Exception as e:
        print(f"[INGEST] CRITICAL ERROR during ingestion: {str(e)}")
        import traceback
        traceback.print_exc()

