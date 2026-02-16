# 🧠 RAG Chatbot — Intelligent Document Assistant












Production-ready Retrieval-Augmented Generation (RAG) system enabling users to upload documents and interact with them through a real-time AI chat interface powered by vector search and LLM streaming.

---

# 🌐 Live Demo

🔗 Live App: (add deployed link later)

---

## 🚀 Features

- **Instant Document Indexing**: Upload PDFs and chat within seconds. Synchronous indexing ensures your data is ready immediately.
- **Per-Session Knowledge**: Each chat session maintains its own isolated FAISS vector database.
- **Streaming Responses**: Token-by-token response streaming from Groq's Llama 3.1 model.
- **Persistent History**: Full chat history and session management powered by MongoDB.
- **Premium UI/UX**: 
  - Sleek glassmorphic design.
  - Dynamic Dark/Light mode support.
  - Interactive status indicators (Indexing, Typing, etc.).
  - Responsive sidebar and auto-resizing chat input.

---

## 📸 Screenshots

### Chat Interface
![Chat UI](screenshots/chat.png)

### Upload & Session Management
![Upload UI](screenshots/upload.png)

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

## 🏗 Architecture & Flow

1. **Ingestion Flow**:
   - PDF is uploaded via the `/upload` endpoint.
   - Files are stored locally in the `uploads/` directory.
   - `PyPDFLoader` extracts text, and `RecursiveCharacterTextSplitter` chunks the data.
   - Chunks are vectorized using HuggingFace embeddings and stored in a unique FAISS index for that session.

2. **Retrieval Flow**:
   - User sends a message via the `/chat` endpoint.
   - The query is vectorized and a similarity search is performed against the session-specific FAISS index.
   - Top-K relevant segments (context) are retrieved.

3. **Generation Flow**:
   - The retrieved context + conversation history + user query are bundled into a specialized prompt.
   - Groq LLM processes the prompt and streams the response back to the client.
   - The final response is asynchronously saved to MongoDB for persistence.

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

