#backend/rag_pipeline.py
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from groq import Groq
import os
from backend.config import GROQ_API_KEY, VECTOR_PATH, embeddings

# session_id -> FAISS DB
db_sessions = {}

# session_id -> conversation history
chat_memory = {}


# Groq client
client = Groq(api_key=GROQ_API_KEY)


# --------------------------------------------------
# Reload FAISS index for a specific session
# Called after ingestion
# --------------------------------------------------
def reload_vectorstore(session_id: str):
    global db_sessions

    # Use absolute path for reliability
    abs_vector_path = os.path.abspath(VECTOR_PATH)
    path = os.path.join(abs_vector_path, session_id)
    
    print(f"[RELOAD] Checking session {session_id} at {path}")

    try:
        if session_id in db_sessions:
            del db_sessions[session_id]
        
        index_file = os.path.join(path, "index.faiss")
        if os.path.exists(index_file):
            print(f"[RELOAD] Found index.faiss. Loading...")
            db_sessions[session_id] = FAISS.load_local(
                path,
                embeddings,
                allow_dangerous_deserialization=True
            )
            print(f"[RELOAD] SUCCESS: Session {session_id} loaded.")
            return True
        else:
            if not os.path.exists(path):
                print(f"[RELOAD] FAILED: Directory {path} does not exist.")
            else:
                print(f"[RELOAD] FAILED: {index_file} missing.")
            return False
    except Exception as e:
        print(f"[RELOAD] ERROR for {session_id}: {str(e)}")
        return False


# --------------------------------------------------
# Ask question using RAG (STREAMING)
# --------------------------------------------------
def ask_question(session_id: str, question: str):
    # Try to load vectorstore if not in memory
    if session_id not in db_sessions:
        reload_vectorstore(session_id)

    if session_id not in db_sessions:
        yield "No document has been uploaded for this chat yet. Please upload a PDF first."
        return


    db = db_sessions[session_id]

    # Use similarity_search to find relevant documents
    docs = db.similarity_search(question, k=5)
    
    print(f"[ASK] Session: {session_id}, Question: {question}")
    print(f"[ASK] Found {len(docs)} documents")
    if docs:
        print(f"[ASK] First chunk preview: {docs[0].page_content[:200]}...")

    if not docs:
        yield "I could not find relevant information in the uploaded documents."
        return

    context = "\n\n".join([d.page_content for d in docs])

    history = chat_memory.get(session_id, [])
    conversation = "\n".join(history[-6:])

    prompt = f"""You are a helpful document assistant. Answer the user's question based on the provided context from their uploaded document.

If the user asks a general question like "what is in the document" or "summarize", provide a summary of the context below.

If the specific answer is not in the context, say so, but still try to be helpful with what IS available.

Previous conversation:
{conversation}

Document context:
{context}

User question: {question}
Assistant:"""


    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )

    full_answer = ""
    for chunk in completion:
        token = chunk.choices[0].delta.content
        if token:
            full_answer += token
            yield token

    # Update history after full answer is generated
    history.append(f"User: {question}")
    history.append(f"Assistant: {full_answer}")
    chat_memory[session_id] = history[-12:]


