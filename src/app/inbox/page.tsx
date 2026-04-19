"use client";

import { useEffect, useState } from "react";

type Message = {
  role: string;
  text: string;
};

type ChatType = {
  _id: string;
  ownerId: string;
  sessionId: string;
  messages: Message[];
};

export default function InboxPage() {
const [chats, setChats] = useState<ChatType[]>([]);
const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
const [message, setMessage] = useState("");

  const fetchChats = async () => {
    const res = await fetch("/api/inbox");
    const data = await res.json();
    setChats(data);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const sendReply = async () => {
    if (!message || !selectedChat) return;

    await fetch("/api/support/inbox/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: selectedChat._id,
        message: message,
        sessionId: selectedChat.sessionId, 
      }),
    });

    setMessage("");
    fetchChats();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <div style={{ width: "30%", borderRight: "1px solid #ddd" }}>
        {chats.map((chat: ChatType) => (
          <div
            key={chat._id}
            onClick={() => setSelectedChat(chat)}
            style={{ padding: 10, cursor: "pointer" }}
          >
            {chat.ownerId}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        {selectedChat ? (
          <>
            <div style={{ height: "70%", overflow: "auto" }}>
              {selectedChat.messages.map((m: Message, i: number) => (
                <div key={i}>
                  <b>{m.role}:</b> {m.text}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", marginTop: 10 }}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ flex: 1 }}
              />
              <button onClick={sendReply}>Send</button>
            </div>
          </>
        ) : (
          <p>Select chat</p>
        )}
      </div>
    </div>
  );
}