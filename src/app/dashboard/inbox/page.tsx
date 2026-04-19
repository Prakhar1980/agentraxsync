"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Inbox() {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await axios.get("/api/support/inbox");
    setChats(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Human Escalations</h1>

      <div className="mt-4 space-y-3">
        {chats.map((chat) => (
          <div key={chat._id} className="border p-4 rounded">
            <p><b>User:</b> {chat.messages?.at(-1)?.text}</p>
            <p><b>Status:</b> {chat.status}</p>

            <button className="mt-2 px-3 py-1 bg-black text-white rounded">
              Open Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}