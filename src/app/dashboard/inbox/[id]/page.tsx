"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { id } = useParams();
  const [chat, setChat] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await axios.get("/api/support/chat/" + id);
    setChat(res.data);
  };

  const sendReply = async () => {
    await axios.post("/api/support/reply", {
      chatId: id,
      message: msg,
    });

    setMsg("");
    load();
  };

  return (
    <div className="p-6">
      <h1 className="font-bold">Chat Detail</h1>

      <div className="mt-4 border p-4 h-[400px] overflow-auto">
        {chat?.messages?.map((m: any, i: number) => (
          <p key={i}>
            <b>{m.role}:</b> {m.text}
          </p>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Reply as human..."
        />
        <button onClick={sendReply} className="bg-black text-white px-4">
          Send
        </button>
      </div>
    </div>
  );
}