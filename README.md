# 🧠 RAG Chatbot — Intelligent Document Assistant












Production-ready Retrieval-Augmented Generation (RAG) system enabling users to upload documents and interact with them through a real-time AI chat interface powered by vector search and LLM streaming.

---

# 🌐 Live Demo

🔗 Live App: (add deployed link later)

---

## 📸 Screenshots

### Chat Interface
![Chat UI](screenshots/chat.png)

### Upload & Session Management
![Upload UI](screenshots/upload.png)

---

## ⭐ Key Features

 - 📄 PDF Upload & Instant Indexing

 - 🔍 Semantic Search using FAISS

 - ⚡ Token-streaming responses (Groq LLM)

 - 💬 Persistent multi-session chat history

 - 📂 Session-based vector databases

 - 🌙 Light / Dark premium UI

 - 🔐 API-secure backend architecture

 - 📊 Scalable modular RAG pipeline

---



## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: [React](https://reactjs.org/)
- **Styling**: Custom Vanilla CSS with Sora Typography
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Orchestration**: [LangChain](https://www.langchain.com/)
- **Vector Store**: [FAISS](https://github.com/facebookresearch/faiss) (CPU-optimized)
- **Embeddings**: [HuggingFace](https://huggingface.co/) (`all-MiniLM-L6-v2`)
- **LLM**: [Groq Cloud](https://groq.com/) (Llama 3.1 8B Instant)

### Database
- **Storage**: [MongoDB](https://www.mongodb.com/) (for message history and session metadata)

---

## 🏗 Architecture 

<img width="406" height="521" alt="image" src="https://github.com/user-attachments/assets/f06d86cc-c61b-43c1-ab47-8d74c1719377" />


---
## 🧩 System Flow

1. User uploads document
2. Backend chunks + embeds text
3. Vectors stored in FAISS
4. User question received
5. Retriever fetches relevant chunks
6. LLM generates contextual answer
7. Response streamed to UI

---

## 🧠 Why This Project Matters

This system demonstrates production-level GenAI engineering skills:

 - Retrieval-Augmented Generation design
 - Vector database orchestration
 - Real-time streaming inference
 - Multi-session architecture
 - Full-stack AI product deployment

---


## 🚦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB instance (Atlas or Local)
- Groq API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file:
   ```env
   GROQ_API_KEY=your_actual_key_here
   MONGO_URI=your_mongodb_uri_here
   ```
5. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── backend/
│   ├── main.py            # FastAPI endpoints & App setup
│   ├── rag_pipeline.py    # RAG logic & LLM integration
│   ├── ingest.py          # Document processing & Vectorization
│   ├── config.py          # Global configurations
│   ├── db.py              # MongoDB connection
│   └── vectorstore/       # Directory for session indices
└── frontend/
    └── src/
        └── app/
            └── page.tsx   # Main Chat UI & State management
```

---

## 💭 Future Roadmap
- [ ] **Multi-file Upload**: Chat with multiple documents simultaneously.
- [ ] **Advanced Citations**: Direct links back to PDF page numbers/sections.
- [ ] **Adaptive Chunking**: Use Semantic Chunking for better context retrieval.
- [ ] **Voice Interaction**: Integration with Whisper for voice-to-chat.

---

## ⭐ License
Built with ❤️ by Vardhan - AI Dev

