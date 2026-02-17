import os
import time
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
VECTOR_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vectorstore")

# Load embedding model once
print("[CONFIG] Loading embedding model...")
start_time = time.time()
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)
print(f"[CONFIG] Model loaded in {time.time() - start_time:.2f}s")



