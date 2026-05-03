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

    setInput("");
    setIsTyping(true);

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const conversationHistory = [...messages, userMessage]
        .filter((m) => m.role === "user" || m.role === "ai")
        .map((m) => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      const data = await res.json();

      if (data.content && data.content[0]?.text) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "ai", content: data.content[0].text },
        ]);
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
        <div style={{
          position: "fixed", bottom: "80px", right: "24px",
          width: "320px", height: "420px",
          background: "#0C1118", border: "1px solid rgba(255,255,255,0.13)",
          borderRadius: "14px", display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 999
        }}>
          <div style={{
            padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", gap: "9px", background: "#111820"
          }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg,#18C97A,#4A90D9)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px"
            }}>🤖</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#EEF2FF" }}>GrowthOS AI</div>
              <div style={{ fontSize: "9.5px", color: "#18C97A" }}>● Online · reads your live data</div>
            </div>
            <div onClick={() => setIsOpen(false)} style={{
              cursor: "pointer", color: "rgba(255,255,255,0.3)",
              marginLeft: "auto", fontSize: "14px"
            }}>✕</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "11px", display: "flex", flexDirection: "column", gap: "7px" }}>
            {messages.map((m) => (
              <div key={m.id} style={{
                maxWidth: "87%", padding: "8px 11px", borderRadius: "11px",
                fontSize: "11.5px", lineHeight: 1.55,
                alignSelf: m.role === "ai" ? "flex-start" : "flex-end",
                background: m.role === "ai" ? "#111820" : "rgba(24,201,122,0.12)",
                border: m.role === "ai" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(24,201,122,0.2)",
                color: m.role === "ai" ? "#EEF2FF" : "#18C97A",
              }}>
                {m.content}
              </div>
            ))}
            {isTyping && (
              <div style={{
                alignSelf: "flex-start", padding: "8px 11px", borderRadius: "11px",
                fontSize: "11.5px", background: "#111820",
                border: "1px solid rgba(255,255,255,0.07)", color: "rgba(238,242,255,0.4)"
              }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "5px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your data..."
              style={{
                flex: 1, background: "#111820", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "7px", padding: "7px 10px", fontSize: "11.5px",
                color: "#EEF2FF", outline: "none", fontFamily: "inherit"
              }}
            />
            <button onClick={sendMessage} style={{
              width: "32px", height: "32px", borderRadius: "7px",
              background: "#18C97A", border: "none", cursor: "pointer",
              fontSize: "13px", color: "#000", fontWeight: 700
            }}>→</button>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} style={{
        position: "fixed", bottom: "24px", right: "24px",
        width: "50px", height: "50px", borderRadius: "50%",
        background: "#18C97A", border: "none", cursor: "pointer",
        fontSize: "20px", boxShadow: "0 4px 20px rgba(24,201,122,0.35)",
        zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        💬
      </button>
    </>
  );
}
