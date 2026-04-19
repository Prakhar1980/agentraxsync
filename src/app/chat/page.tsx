"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false); 

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          ownerId: "demo-id",
          sessionId: "sess_demo_123",
        }),
      });

      const data = await res.json();
      setIsEscalated(data.escalated);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error connecting to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      <div className="p-4 bg-white shadow font-bold text-lg flex justify-between">
        <span>SupportSync Chat 🤖</span>

        {/* escalation status */}
        {isEscalated && (
          <span className="text-sm text-red-500">
            Connecting to agent...
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${
                msg.role === "user"
                  ? "bg-black text-white"
                  : "bg-white border"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-500">AI is typing...</div>
        )}

        <div ref={chatRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white flex gap-2 border-t">
        <input
          className="flex-1 border rounded-xl px-4 py-2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 py-2 rounded-xl"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}