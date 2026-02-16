//frontend/src/components/Upload.tsx

"use client";

import { useState, useRef } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Uploaded successfully");
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      alert("Error connecting to server");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Hidden real input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Button that manually triggers the input */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          padding: "8px 16px",
          backgroundColor: "#555",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "10px",
          display: "block",
        }}
      >
        Choose PDF
      </button>

      {file && (
        <div style={{ marginBottom: "10px" }}>
          ✅ Selected: {file.name}
        </div>
      )}

      <button
        type="button"
        onClick={uploadFile}
        style={{
          padding: "8px 16px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Upload PDF
      </button>
    </div>
  );
}