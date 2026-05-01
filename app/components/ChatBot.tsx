"use client";

import React, { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: number;
  role: "user" | "ai";
  content: string;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "ai",
      content: "Hi! I am GrowthOS AI. Ask me about your growth metrics, leaks, or campaign ideas.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { id: Date.now(), role: "ai", content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "ai", content: `Error: ${JSON.stringify(data)}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "ai",
          content: "Something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "86px",
            width: "305px",
            height: "405px",
            background: "#0C1118",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: "14px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "999px",
                  background: "#18C97A",
                  boxShadow: "0 0 10px rgba(24, 201, 122, 0.75)",
                }}
              />
              <span style={{ color: "#EEF2FF", fontWeight: 700, fontSize: "14px" }}>GrowthOS AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                color: "#7A8AA8",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "86%",
                  borderRadius: "10px",
                  padding: "9px 10px",
                  fontSize: "13px",
                  lineHeight: 1.45,
                  color: message.role === "user" ? "#18C97A" : "#EEF2FF",
                  background:
                    message.role === "user"
                      ? "rgba(24,201,122,0.12)"
                      : "#111820",
                }}
              >
                {message.content}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#111820",
                  color: "#7A8AA8",
                  borderRadius: "10px",
                  padding: "9px 10px",
                  fontSize: "13px",
                }}
              >
                GrowthOS AI is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "10px",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask GrowthOS AI..."
              style={{
                flex: 1,
                background: "#111820",
                border: "1px solid rgba(255,255,255,0.11)",
                borderRadius: "9px",
                color: "#EEF2FF",
                fontSize: "13px",
                padding: "9px 10px",
                outline: "none",
              }}
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isTyping}
              style={{
                border: "none",
                borderRadius: "9px",
                padding: "0 12px",
                background: !input.trim() || isTyping ? "rgba(24,201,122,0.4)" : "#18C97A",
                color: "#07110D",
                fontWeight: 700,
                fontSize: "12px",
                cursor: !input.trim() || isTyping ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#18C97A",
          color: "#07110D",
          fontSize: "22px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 12px 30px rgba(24, 201, 122, 0.35)",
          zIndex: 1200,
        }}
        aria-label="Open GrowthOS AI chat"
      >
        💬
      </button>
    </>
  );
}
