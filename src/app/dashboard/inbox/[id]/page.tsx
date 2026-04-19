"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function ChatPage() {
  const { id } = useParams();

  const [chat, setChat] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [connected, setConnected] = useState(false);
  const [agentName] = useState("Advik Support");
  const [socket, setSocket] = useState<any>(null);

  // ✅ Render / production socket url
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

    let s: any;

    if (!(window as any).__agent_socket) {
      s = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      (window as any).__agent_socket = s;
      console.log("✅ Agent socket created:", SOCKET_URL);
    } else {
      s = (window as any).__agent_socket;
      console.log("♻️ Reusing agent socket");
    }

    setSocket(s);

    // ✅ join agent room
    s.emit("join", {
      sessionId: chat.sessionId,
      role: "agent",
      agentName,
      ownerId: chat?.ownerId,
    });

    // remove duplicate listeners
    s.off("receive_message");
    s.off("agent_joined");

    s.on("receive_message", (data: any) => {
      console.log("📩 Agent received:", data);

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
      s.off("receive_message");
      s.off("agent_joined");
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

      // ✅ show message instantly without reload
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

      <button
        onClick={async () => {
          await axios.post("/api/support/chat/end", {
            sessionId: chat?.sessionId,
            ownerId: chat?.ownerId,
          });
          alert("Chat ended");
        }}
        className="mt-2 text-sm text-red-500"
      >
        End Chat
      </button>

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