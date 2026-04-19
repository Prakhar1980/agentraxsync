(function () {
  function init() {
    const scriptTag =
      document.currentScript ||
      document.querySelector("script[data-owner-id]");

    const ownerId =
      scriptTag?.getAttribute("data-owner-id") ||
      window.CHATBOT_OWNER_ID;

    if (!ownerId) {
      console.error("❌ ownerId not found");
      return;
    }

    const API_URL =
      scriptTag?.getAttribute("data-api-url") ||
      "http://localhost:3000/api/chat";

    // 🔥 SESSION (FIXED)
    let sessionId = localStorage.getItem("agentrax_session");

    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substring(2);
      localStorage.setItem("agentrax_session", sessionId);
    }

    /* ================= SOCKET ================= */
 const socket = io("http://localhost:3000");

socket.emit("join", sessionId);

socket.on("receive_message", (data) => {
  addMessage(data.text, "bot");
});

    /* ================= UI ================= */

    const button = document.createElement("div");
    button.innerHTML = "💬";

    Object.assign(button.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "55px",
      height: "55px",
      borderRadius: "50%",
      background: "#000",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: "999999",
      fontSize: "22px",
    });

    document.body.appendChild(button);

    const chatBox = document.createElement("div");

    Object.assign(chatBox.style, {
      position: "fixed",
      bottom: "90px",
      right: "20px",
      width: "320px",
      height: "420px",
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      display: "none",
      flexDirection: "column",
      zIndex: "999999",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      overflow: "hidden",
    });

    chatBox.innerHTML = `
      <div style="padding:10px; background:#000; color:#fff;">
        Support Chat
      </div>

      <div id="chat-messages" style="flex:1; padding:10px; overflow-y:auto;"></div>

      <div style="display:flex; border-top:1px solid #ddd;">
        <input id="chat-input" placeholder="Type..." 
          style="flex:1; border:none; padding:10px; outline:none;" />
        <button id="chat-send" 
          style="padding:10px; border:none; background:#000; color:#fff;">
          Send
        </button>
      </div>
    `;

    document.body.appendChild(chatBox);

    button.onclick = () => {
      chatBox.style.display =
        chatBox.style.display === "none" ? "flex" : "none";
    };

    const messagesDiv = chatBox.querySelector("#chat-messages");
    const input = chatBox.querySelector("#chat-input");
    const sendBtn = chatBox.querySelector("#chat-send");

    function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.style.marginBottom = "8px";
      msg.style.textAlign = sender === "user" ? "right" : "left";

      msg.innerHTML = `
        <span style="
          background:${sender === "user" ? "#000" : "#eee"};
          color:${sender === "user" ? "#fff" : "#000"};
          padding:6px 10px;
          border-radius:10px;
          display:inline-block;
          max-width:80%;
        ">
          ${text}
        </span>
      `;

      messagesDiv.appendChild(msg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /* ================= RECEIVE REAL-TIME ================= */

    socket.on("receive_message", (msg) => {
      addMessage(msg.text, msg.role === "human" ? "bot" : msg.role);
    });

    socket.on("typing", () => {
      showTyping();
    });

    socket.on("stop_typing", () => {
      hideTyping();
    });

    function showTyping() {
      if (!document.getElementById("typing")) {
        const t = document.createElement("div");
        t.id = "typing";
        t.innerText = "Agent is typing...";
        t.style.fontSize = "12px";
        t.style.color = "#666";
        messagesDiv.appendChild(t);
      }
    }

    function hideTyping() {
      const t = document.getElementById("typing");
      if (t) t.remove();
    }

    /* ================= SEND MESSAGE ================= */

    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      addMessage(message, "user");
      input.value = "";

      // 🔥 REALTIME SEND
      socket.emit("send_message", {
        sessionId,
        message: {
          role: "user",
          text: message,
        },
      });

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            ownerId,
            sessionId,
          }),
        });

        const data = await res.json();
        
        if (data.askHuman) {
          addMessage("👤 Do you want to connect to a human agent? (yes/no)", "bot");
}

        addMessage(data.reply, "bot");

        if (data.escalated) {
          addMessage("🧑‍💼 Connecting to human agent...", "bot");
        }
      } catch (err) {
        addMessage("Server error ❌", "bot");
      }
    }

    sendBtn.onclick = sendMessage;

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();