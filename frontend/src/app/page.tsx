//frontend/src/app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

/* ─────────────────────────────────────────────
   Toast Notification Component
───────────────────────────────────────────── */
function Toast({ message, type, visible, dark }: { message: string; type: 'success' | 'error' | 'info'; visible: boolean; dark: boolean }) {
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      animation: visible ? 'slideInToast 0.3s ease' : 'slideOutToast 0.3s ease',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: bgColor,
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        {message}
      </div>
    </div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm, dark }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; dark: boolean }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeUp 0.2s ease"
    }}>
      <div style={{
        width: "90%", maxWidth: "400px", padding: "24px", borderRadius: "20px",
        background: dark ? "#13141f" : "#fff", border: `1px solid ${dark ? "#2d2f45" : "#e2e8f0"}`,
        textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        <div style={{ color: "#ef4444", marginBottom: "16px" }}><Trash2 size={48} style={{ margin: "0 auto" }} /></div>
        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>Delete this chat?</h3>
        <p style={{ color: "#6b6f88", fontSize: "14px", marginBottom: "24px" }}>You'll lose all messages in this conversation. This action cannot be undone.</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: dark ? "#1e1f2e" : "#f1f5f9", color: dark ? "#fff" : "#1e293b", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Inline Upload component 
───────────────────────────────────────────── */
function Upload({
  dark,
  sessionId,
  onUploaded,
  showToast,
  setIsProcessing
}: {
  dark: boolean;
  sessionId: string | null;
  onUploaded: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  setIsProcessing: (val: boolean) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!sessionId) {
      showToast("Create a chat first before uploading.", "info");
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("session_id", sessionId);

      const response = await fetch("https://rag-chatbot-nsyr.onrender.com/upload", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        showToast(`Upload failed: ${data.message}`, "error");
        setUploading(false);
        setFileName(null);
        return;
      }

      setUploading(false);
      setDone(true);
      setIsProcessing(false);
      showToast(`${file.name} indexed and ready! Ask your questions.`, "success");
      onUploaded();

      setTimeout(() => {
        setDone(false);
        setFileName(null);
      }, 3000);



    } catch (error) {
      console.error('Upload error:', error);
      showToast(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
      setUploading(false);
      setFileName(null);
    }
  };



  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px solid ${dragging ? "#6c8ef5" : dark ? "#2d2f45" : "#e2e8f0"}`,
        borderRadius: "12px",
        padding: "18px 28px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        gap: "12px",
        background: dragging ? (dark ? "rgba(108,142,245,0.1)" : "rgba(108,142,245,0.05)") : "transparent",
        transition: "all 0.2s",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: done ? "#10b981" : "inherit", fontSize: "14px" }}>
        {uploading
          ? "⏳ Uploading…"
          : done
            ? `✓ Uploaded!`
            : fileName
              ? fileName
              : "📁 Upload a document"}
      </span>
      {uploading && (
        <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#6c8ef5", animation: "bounce 1s infinite" }} />
      )}
    </div>
  );
}


/* ─────────────────────────────────────────────
   Message bubble
───────────────────────────────────────────── */
function Bubble({ role, content, dark }: { role: "user" | "assistant"; content: string; dark: boolean }) {
  const isUser = role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "6px",
      animation: "fadeUp 0.25s ease",
    }}>
      {!isUser && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "linear-gradient(135deg,#6c8ef5,#a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginRight: "10px", marginTop: "2px",
          fontSize: "13px", color: "#fff", fontWeight: 700,
        }}>AI</div>
      )}
      <div style={{
        maxWidth: "72%",
        padding: isUser ? "10px 16px" : "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg,#6c8ef5,#818cf8)"
          : dark ? "#1e1f2e" : "#f1f5f9",
        color: isUser ? "#fff" : dark ? "#e2e4f0" : "#1e293b",
        fontSize: "15px",
        lineHeight: "1.6",
        letterSpacing: "0.01em",
        boxShadow: isUser ? "0 2px 12px rgba(108,142,245,0.3)" : dark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.08)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {content}
      </div>
      {isUser && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: dark ? "#2d2f45" : "#e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginLeft: "10px", marginTop: "2px",
          fontSize: "13px", color: dark ? "#8b8fa8" : "#64748b",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Typing dots indicator
───────────────────────────────────────────── */
function TypingDots({ dark }: { dark: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "6px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: "linear-gradient(135deg,#6c8ef5,#a78bfa)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginRight: "10px",
        fontSize: "13px", color: "#fff", fontWeight: 700,
      }}>AI</div>
      <div style={{
        padding: "14px 18px",
        borderRadius: "18px 18px 18px 4px",
        background: dark ? "#1e1f2e" : "#f1f5f9",
        display: "flex", gap: "5px", alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: dark ? "#6c8ef5" : "#94a3b8",
            display: "inline-block",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main App
───────────────────────────────────────────── */
export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToastVisible] = useState(false);

  const showToastNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToastVisible(true);
    setTimeout(() => setShowToastVisible(false), 3500);
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [dark, setDark] = useState(true);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const bg = dark ? "#0f1017" : "#f8fafc";
  const sidebar = dark ? "#13141f" : "#ffffff";
  const sidebarBorder = dark ? "#1e1f2e" : "#e2e8f0";
  const inputBg = dark ? "#1a1b2e" : "#ffffff";
  const inputBorder = dark ? "#2d2f45" : "#e2e8f0";
  const textPrimary = dark ? "#e2e4f0" : "#1e293b";
  const textMuted = dark ? "#6b6f88" : "#94a3b8";
  const hoverBg = dark ? "#1e1f2e" : "#f1f5f9";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [question]);

  useEffect(() => {
    fetch("https://rag-chatbot-nsyr.onrender.com/sessions")
      .then(res => res.json())
      .then(setSessions);
  }, []);

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    await fetch(`https://rag-chatbot-nsyr.onrender.com/delete-session?session_id=${sessionToDelete}`, {
      method: "DELETE"
    });

    setSessions((prev) => prev.filter((x) => x.session_id !== sessionToDelete));

    if (sessionId === sessionToDelete) {
      setMessages([]);
      setSessionId(null);
    }

    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const askQuestion = async () => {
    if (!sessionId) {
      showToastNotification("Create a chat first before asking questions.", "info");
      return;
    }

    if (!question.trim() || loading) return;

    const userMessage = { role: "user" as const, content: question.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(
        `https://rag-chatbot-nsyr.onrender.com/chat?session_id=${sessionId}&q=${encodeURIComponent(question.trim())}`
      );

      const reader = res.body?.getReader();
      let aiMessage = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        aiMessage += chunk;
        setMessages([...newMessages, { role: "assistant", content: aiMessage }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Could not connect to the server. Make sure your backend is running." }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const createSession = async () => {
    setDocUploaded(false);

    // Check if there's already an unsaved "New Chat" session
    const existingNewChat = sessions.find(s => s.title === "New Chat");
    if (existingNewChat) {
      setSessionId(existingNewChat.session_id);
      setMessages([]);
      return;
    }

    const res = await fetch("https://rag-chatbot-nsyr.onrender.com/create-session", {
      method: "POST",
    });

    const data = await res.json();
    setSessionId(data.session_id);
    setMessages([]);

    const s = await fetch("https://rag-chatbot-nsyr.onrender.com/sessions");
    setSessions(await s.json());
  };

  const suggestedPrompts = [
    "Summarize the uploaded document",
    "What are the key points?",
    "Explain this in simple terms",
    "List the main conclusions",
  ];

  return (
    <>
      <Toast message={toastMessage} type={toastType} visible={showToast} dark={dark} />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSessionToDelete(null);
        }}
        onConfirm={confirmDelete}
        dark={dark}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${dark ? "#2d2f45" : "#cbd5e1"}; border-radius: 99px; }
        textarea { font-family: 'Sora', sans-serif; resize: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(400px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutToast {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(400px); }
        }
        .send-btn:hover { opacity: 0.85; transform: scale(0.97); }
        .send-btn:active { transform: scale(0.93); }
        .sidebar-item:hover { background: ${hoverBg}; }
        .suggested:hover { background: ${dark ? "#1e1f2e" : "#f1f5f9"} !important; border-color: #6c8ef5 !important; }
        .theme-toggle:hover { background: ${hoverBg}; }
        .overlay { display: none; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .overlay { display: ${sidebarOpen ? "block" : "none"}; }
        }
      `}</style>


      <div style={{
        display: "flex",
        height: "100dvh",
        background: bg,
        color: textPrimary,
        overflow: "hidden",
        fontFamily: "'Sora', sans-serif",
        transition: "background 0.3s, color 0.3s",
      }}>

        {sidebarOpen && (
          <div
            className="overlay"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 40, backdropFilter: "blur(2px)",
            }}
          />
        )}

        <aside style={{
          width: "260px",
          flexShrink: 0,
          background: sidebar,
          borderRight: `1px solid ${sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          padding: "16px 12px",
          gap: "6px",
          transition: "transform 0.3s ease, background 0.3s",
          zIndex: 50,
          position: isMobile ? "fixed" : "relative",
          transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
          height: "100dvh",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 8px 14px", borderBottom: `1px solid ${sidebarBorder}`,
            marginBottom: "4px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg,#6c8ef5,#a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.02em" }}>RAG Chat</span>
          </div>

          <button
            onClick={createSession}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "10px",
              background: "linear-gradient(135deg,rgba(108,142,245,0.15),rgba(167,139,250,0.15))",
              border: "1px solid rgba(108,142,245,0.3)",
              color: "#6c8ef5", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Sora', sans-serif",
              transition: "all 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>

          <div style={{ height: "1px", background: sidebarBorder, margin: "4px 0" }} />

          <p style={{ fontSize: "11px", fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 8px" }}>
            Recent
          </p>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {sessions.map((s) => (
              <div
                key={s.session_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: sessionId === s.session_id ? hoverBg : "transparent",
                }}
              >
                <button
                  onClick={async () => {
                    setSessionId(s.session_id);
                    setDocUploaded(false);   // IMPORTANT
                    const res = await fetch(`https://rag-chatbot-nsyr.onrender.com/history?session_id=${s.session_id}`);
                    const data = await res.json();
                    setMessages(data);
                  }}

                  style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: textPrimary, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {s.title}
                </button>

                <button
                  onClick={() => {
                    setSessionToDelete(s.session_id);
                    setShowDeleteModal(true);
                  }}
                  style={{ marginLeft: "8px", background: "transparent", border: "none", cursor: "pointer", color: textMuted }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ flexShrink: 0, marginTop: "auto" }}>
            <Upload
              dark={dark}
              sessionId={sessionId}
              onUploaded={() => {
                setDocUploaded(true);
              }}
              showToast={showToastNotification}
              setIsProcessing={setIsProcessing}
            />


            <button
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "10px", marginTop: "10px",
                background: "transparent", border: `1px solid ${sidebarBorder}`,
                color: textMuted, fontSize: "13.5px",
                cursor: "pointer", fontFamily: "'Sora', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </aside>

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          overflow: "hidden",
        }}>

          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: `1px solid ${sidebarBorder}`,
            background: dark ? "rgba(15,16,23,0.8)" : "rgba(248,250,252,0.8)",
            backdropFilter: "blur(12px)",
            flexShrink: 0,
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: isMobile ? "flex" : "none",
                background: "none", border: "none", cursor: "pointer",
                color: textMuted, padding: "4px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: isProcessing ? "#f59e0b" : "#4ade80",
                boxShadow: isProcessing ? "0 0 6px #f59e0b" : "0 0 6px #4ade80",
              }} />
              <span style={{ fontSize: "14px", fontWeight: 500, color: textMuted }}>
                {isProcessing ? "Indexing Document..." : "RAG Chatbot"}
              </span>
              {isProcessing && (
                <div style={{
                  width: "14px", height: "14px", border: "2px solid rgba(245,158,11,0.3)",
                  borderTopColor: "#f59e0b", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }} />
              )}
            </div>


            <button
              onClick={() => setDark(!dark)}
              style={{
                background: "none", border: `1px solid ${sidebarBorder}`,
                borderRadius: "8px", cursor: "pointer",
                color: textMuted, padding: "6px 10px",
                fontSize: "13px", display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </header>

          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 20px 16px",
            display: "flex",
            flexDirection: "column",
          }}>
            {messages.length === 0 ? (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "28px", paddingBottom: "60px",
                animation: "fadeUp 0.4s ease",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "20px",
                    background: "linear-gradient(135deg,#6c8ef5,#a78bfa)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 8px 32px rgba(108,142,245,0.35)",
                  }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                    Ask anything
                  </h2>
                  <p style={{ color: textMuted, fontSize: "15px", maxWidth: "340px", lineHeight: 1.6 }}>
                    Upload a document and start chatting. I'll answer questions based on your content.
                  </p>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "10px",
                  width: "100%",
                  maxWidth: "580px",
                }}>
                  {suggestedPrompts.map((p, i) => (
                    <button
                      key={i}
                      className="suggested"
                      onClick={() => { setQuestion(p); textareaRef.current?.focus(); }}
                      style={{
                        padding: "12px 16px",
                        background: "transparent",
                        border: `1px solid ${sidebarBorder}`,
                        borderRadius: "12px",
                        color: textMuted,
                        fontSize: "13.5px",
                        cursor: "pointer",
                        fontFamily: "'Sora', sans-serif",
                        textAlign: "left",
                        lineHeight: 1.4,
                        transition: "all 0.2s",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: "720px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role} content={m.content} dark={dark} />
                ))}
                {loading && <TypingDots dark={dark} />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div style={{
            padding: "12px 20px 20px",
            borderTop: `1px solid ${sidebarBorder}`,
            background: dark ? "rgba(15,16,23,0.9)" : "rgba(248,250,252,0.9)",
            backdropFilter: "blur(12px)",
            flexShrink: 0,
          }}>
            <div style={{
              maxWidth: "720px",
              margin: "0 auto",
              display: "flex",
              alignItems: "flex-end",
              gap: "10px",
              background: inputBg,
              border: `1.5px solid ${inputBorder}`,
              borderRadius: "16px",
              padding: "10px 12px 10px 16px",
              boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message RAG Chat…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: textPrimary,
                  fontSize: "15px",
                  lineHeight: "1.6",
                  padding: "2px 0",
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
              />

              <button
                className="send-btn"
                onClick={askQuestion}
                disabled={!question.trim() || loading}
                style={{
                  width: "38px", height: "38px",
                  borderRadius: "10px",
                  background: question.trim() && !loading
                    ? "linear-gradient(135deg,#6c8ef5,#818cf8)"
                    : dark ? "#2d2f45" : "#e2e8f0",
                  border: "none",
                  cursor: question.trim() && !loading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  boxShadow: question.trim() && !loading ? "0 2px 10px rgba(108,142,245,0.4)" : "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={question.trim() && !loading ? "white" : textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

            <p style={{
              textAlign: "center", fontSize: "11.5px",
              color: textMuted, marginTop: "10px",
              opacity: 0.6,
            }}>
              Built with ❤️ by Vardhan - AI Dev          </p>
          </div>
        </div>
      </div>
    </>
  );
}