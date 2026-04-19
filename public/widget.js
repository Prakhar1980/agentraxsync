(function () {
async function loadSocketIO() {
    if (window.io) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Socket.IO client"));
      document.head.appendChild(script);
    });
  }

  async function init() {
    console.log(" Widget Loaded");

  
    await loadSocketIO();

    let agentTimer = null;
    let timerInterval = null;
    let isAgentMode = false;

    const scriptTag =
      document.currentScript ||
      document.querySelector("script[data-owner-id]");

    const ownerId =
      scriptTag?.getAttribute("data-owner-id") ||
      window.CHATBOT_OWNER_ID;

    if (!ownerId) {
      console.error(" ownerId not found");
      return;
    }

    const API_URL =
      scriptTag?.getAttribute("data-api-url") ||
      "http://localhost:3000/api/chat";

    const SOCKET_URL =
      scriptTag?.getAttribute("data-socket-url") ||
      "http://localhost:3000";

    /* SESSION */

    if (window.__agentrax_initialized) return;
    window.__agentrax_initialized = true;

    let sessionId = localStorage.getItem("agentrax_session");

    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substring(2);
      localStorage.setItem("agentrax_session", sessionId);
    }

    /* SOCKET */

    let socket;

    if (!window.__agentrax_socket) {
      socket = window.io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      window.__agentrax_socket = socket;
    } else {
      socket = window.__agentrax_socket;
      console.log("♻️ Reusing existing socket");
    }

    if (!window.__agentrax_joined) {
      socket.emit("join", {
        sessionId,
        role: "user",
        ownerId,
      });

      window.__agentrax_joined = true;
    }

    console.log("🔗 Socket Room:", sessionId);

    /* UI */

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
      <div id="chat-header" style="padding:10px; background:#000; color:#fff;">
        AI Support
      </div>

      <div id="chat-messages" style="flex:1; padding:10px; overflow-y:auto;"></div>

      <div id="agent-timer" style="
        display:none;
        font-size:12px;
        color:#2563eb;
        padding:5px 10px;
      "></div>

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
    const headerEl = chatBox.querySelector("#chat-header");

    function setHeader(mode) {
      if (!headerEl) return;
      if (mode === "agent") {
        headerEl.innerText = "Human Support";
      } else {
        headerEl.innerText = "AI Support";
      }
    }

    function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.style.marginBottom = "8px";
      msg.style.textAlign = sender === "user" ? "right" : "left";

      let bg = "#eee";
      let color = "#000";

      if (sender === "user") {
        bg = "#000";
        color = "#fff";
      }

      if (sender === "agent") {
        bg = "#16a34a";
        color = "#fff";
      }

      msg.innerHTML = `
        <span style="
          background:${bg};
          color:${color};
          padding:6px 10px;
          border-radius:10px;
          display:inline-block;
          max-width:80%;
          word-break:break-word;
        ">
          ${text}
        </span>
      `;

      messagesDiv.appendChild(msg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /* TIMER */

    function startAgentTimer(seconds = 120) {
      const timerEl = document.getElementById("agent-timer");
      if (!timerEl) return;

      agentTimer = seconds;
      timerEl.style.display = "block";
      timerEl.innerText = `Connecting to agent... ${agentTimer}s`;

      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        agentTimer--;

        if (agentTimer <= 0) {
          clearInterval(timerInterval);

          isAgentMode = false;
          setHeader("ai");

          addMessage("All agents are busy. AI will assist you now.", "bot");

          timerEl.style.display = "none";
          return;
        }

        timerEl.innerText = `Connecting to agent... ${agentTimer}s`;
      }, 1000);
    }

    function stopAgentTimer() {
      const timerEl = document.getElementById("agent-timer");

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      agentTimer = null;

      if (timerEl) timerEl.style.display = "none";
    }

    /* SOCKET RECEIVE */

    let lastBotMessage = "";

    socket.off("receive_message");
    socket.off("chat_ended_by_agent");

    socket.on("receive_message", (data) => {
      console.log("📩 RECEIVED:", data);

      const { message, sender } = data || {};

      if (!message) return;

      if (sender === "bot") {
        if (message === lastBotMessage) return;
        lastBotMessage = message;
      }

      if (sender === "agent") {
        stopAgentTimer();
        isAgentMode = true;
        setHeader("agent");
      }

      addMessage(message, sender);
    });

    socket.on("chat_ended_by_agent", (data) => {
      stopAgentTimer();
      isAgentMode = false;
      setHeader("ai");

      addMessage(
        data?.message || "Agent ended the chat. AI will assist you now.",
        "bot"
      );
    });

    /* SEND */

    let isSending = false;

    async function sendMessage() {
      if (isSending) return;

      const message = input.value.trim();
      if (!message) return;

      isSending = true;

      addMessage(message, "user");
      input.value = "";

      const typingMsg = document.createElement("div");
      typingMsg.innerHTML = `<span style="
        background:#eee;
        padding:6px 10px;
        border-radius:10px;
        display:inline-block;
      ">Typing...</span>`;

      messagesDiv.appendChild(typingMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

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

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = { reply: "Server error " };
        }

        typingMsg.remove();

        if (data.welcomeMessage) {
          addMessage(data.welcomeMessage, "bot");
        }

        if (data.agentHintMessage) {
          addMessage(data.agentHintMessage, "bot");
        }

        if (data.reply) {
          if (data.reply !== lastBotMessage) {
            lastBotMessage = data.reply;
            addMessage(data.reply, "bot");
          }
        }

        if (data.escalated) {
          startAgentTimer(120);
          socket.emit("request_human", { sessionId, ownerId });
        } else {
          stopAgentTimer();
          isAgentMode = false;
          setHeader("ai");
        }
      } catch (err) {
        console.error(err);
        typingMsg.remove();
        addMessage("Server error ", "bot");
      }

      isSending = false;
    }

    sendBtn.onclick = sendMessage;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init();
    });
  } else {
    init();
  }
})();