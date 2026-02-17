from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(
    os.getenv("MONGO_URI"),
    serverSelectionTimeoutMS=5000  # 5 second timeout
)

db = client["rag_chat"]

sessions_col = db["sessions"]
messages_col = db["messages"]
