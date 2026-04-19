"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function ChatClient() {
  const { id } = useParams();

  const [chat, setChat] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [connected, setConnected] = useState(false);
  const [agentName] = useState("Advik Support");
  const [socket, setSocket] = useState<any>(null);

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://agentraxsync.onrender.com";

  const load = async () => {
    try {
      const res = await axios.get("/api/support/chat/" + id);
      setChat(res.data);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  useEffect(() => {
    if (!chat?.sessionId) return;

    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    setSocket(s);

    s.emit("join", {
      sessionId: chat.sessionId,
      role: "agent",
      agentName,
      ownerId: chat?.ownerId,
    });

    s.on("receive_message", (data: any) => {
      setChat((prev: any) => ({
        ...prev,
        messages: [
          ...(prev?.messages || []),
          {
            role: data.sender,
            text: data.message,
          },
        ],
      }));
    });

    s.on("agent_joined", (data: any) => {
      setConnected(true);

      setChat((prev: any) => ({
        ...prev,
        messages: [
          ...(prev?.messages || []),
          {
            role: "bot",
            text: `${data.name} joined the chat`,
          },
        ],
      }));
    });

    return () => {
      s.disconnect();
    };
  }, [chat?.sessionId]);

  const acceptChat = () => {
    if (!socket || !chat?.sessionId || !chat?.ownerId) return;

    socket.emit("agent_accept", {
      sessionId: chat.sessionId,
      agentName,
      ownerId: chat.ownerId,
    });

    setConnected(true);
  };

  const sendReply = async () => {
    if (!msg.trim()) return;

    try {
      await axios.post("/api/support/inbox/reply", {
        chatId: id,
        message: msg,
        sessionId: chat?.sessionId,
      });

      setChat((prev: any) => ({
        ...prev,
        messages: [
          ...(prev?.messages || []),
          {
            role: "agent",
            text: msg,
          },
        ],
      }));

      setMsg("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="font-bold text-lg">Support Chat</h1>

      <div className="mt-2 text-sm">
        {chat?.isOnline ? (
          <span className="text-green-600">🟢 User Online</span>
        ) : chat?.ended ? (
          <span className="text-red-500">❌ Chat Ended</span>
        ) : (
          <span className="text-gray-500">⚫ Offline</span>
        )}
      </div>

      {!connected && (
        <button
          onClick={acceptChat}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
        >
          Accept Chat
        </button>
      )}

      <div className="mt-4 border p-4 h-[400px] overflow-auto bg-gray-50 rounded">
        {chat?.messages?.map((m: any, i: number) => (
          <div
            key={i}
            className={`mb-2 ${
              m.role === "agent" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-lg max-w-[70%] ${
                m.role === "agent"
                  ? "bg-black text-white"
                  : m.role === "user"
                  ? "bg-white border"
                  : "bg-gray-200"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="border p-2 flex-1 rounded"
          placeholder="Reply as human..."
        />
        <button onClick={sendReply} className="bg-black text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}