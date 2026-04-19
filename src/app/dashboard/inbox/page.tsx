"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function InboxPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get("/api/support/inbox", {
        headers: { "Cache-Control": "no-cache" },
      });

      setChats(res.data || []);
    } catch (err) {
      console.error("Inbox load error", err);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Human Escalations</h1>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && chats.length === 0 && (
        <p className="text-gray-500">No chats found</p>
      )}

      <div className="space-y-3">
        {chats.map((chat) => (
          <Link
            key={chat._id}
            href={`/dashboard/inbox/${chat._id}`}
            className="block border p-3 rounded hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                Session: {chat.sessionId}
              </span>

              <span className="text-sm">
                {chat.isOnline ? "🟢" : "⚫"}
              </span>
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Status: {chat.status}</span>
              <span>
                {chat.lastSeen
                  ? new Date(chat.lastSeen).toLocaleString()
                  : "N/A"}
              </span>
            </div>

            {chat.escalated && (
              <p className="text-xs mt-1 text-blue-600">
                Escalated to Human Support
              </p>
            )}

            {chat.awaitingConfirmation && (
              <p className="text-xs mt-1 text-orange-600">
                Waiting for confirmation
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}