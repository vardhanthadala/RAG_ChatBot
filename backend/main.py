#backend/main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import shutil
import os
import uuid
import time
from datetime import datetime

# Local imports
from backend.db import sessions_col, messages_col
from backend.rag_pipeline import ask_question, reload_vectorstore
from backend.ingest import ingest_pdf
from backend.config import VECTOR_PATH

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def home():
    return {"status": "RAG running"}

# ---------- SESSION MANAGEMENT ----------
@app.post("/create-session")
def create_session():
    session_id = str(uuid.uuid4())

    sessions_col.insert_one({
        "session_id": session_id,
        "title": "New Chat",
        "created_at": datetime.utcnow()
    })

    return {"session_id": session_id}


@app.get("/sessions")
def get_sessions():
    return list(sessions_col.find({}, {"_id": 0}).sort("created_at", -1))


@app.delete("/delete-session")
def delete_session(session_id: str):

    sessions_col.delete_one({"session_id": session_id})
    messages_col.delete_many({"session_id": session_id})

    path = os.path.join(VECTOR_PATH, session_id)
    if os.path.exists(path):
        shutil.rmtree(path)

    return {"status": "deleted"}

@app.get("/history")
def get_history(session_id: str):
    return list(messages_col.find({"session_id": session_id}, {"_id": 0}))

# ---------- UPLOAD PDF ----------
@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    session_id: str = Form("default")
):
    try:
        if not session_id or session_id.strip() == "":
            session_id = "default"

        print(f"\n[UPLOAD] Session: {session_id}, File: {file.filename}")

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # SYNCHRONOUS ingestion — reliable, fast for small files
        start = time.time()
        ingest_pdf(file_path, session_id)
        reload_vectorstore(session_id)
        elapsed = round(time.time() - start, 2)
        print(f"[UPLOAD] Ingestion + reload done in {elapsed}s")

        # Update session title
        sessions_col.update_one(
            {"session_id": session_id},
            {"$set": {"title": file.filename, "updated_at": datetime.utcnow()}},
            upsert=True
        )

        return {"message": f"Uploaded and indexed in {elapsed}s", "status": "success"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"message": f"Error: {str(e)}", "status": "error"}



# ---------- CHAT (STREAMING) ----------
@app.get("/chat")
def chat(session_id: str, q: str):

  

    
    # Update title if it's a new chat
    session = sessions_col.find_one({"session_id": session_id})
    if session and session["title"] == "New Chat":
        sessions_col.update_one(
            {"session_id": session_id},
            {"$set": {"title": q[:40]}}
        )

    def generate():
        full_answer = ""
        # The ask_question now yields tokens
        for token in ask_question(session_id, q):
            full_answer += token
            yield token
        
        # Save to database AFTER the full answer is collected
        if full_answer:
            messages_col.insert_many([
                {"session_id": session_id, "role": "user", "content": q},
                {"session_id": session_id, "role": "assistant", "content": full_answer}
            ])

    return StreamingResponse(generate(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

