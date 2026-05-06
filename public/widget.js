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
      new URL(API_URL, window.location.href).origin;

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
        sessionId: sessionId.trim(),
        role: "user",
        ownerId,
      });

      window.__agentrax_joined = true;
    }

    console.log("🔗 Socket Room:", sessionId);

    /* UI */

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Open support chat");
    button.innerHTML = `
      <span style="
        position:absolute;
        inset:-2px;
        border-radius:50%;
        background:linear-gradient(135deg,#38bdf8,#22c55e);
        opacity:.72;
        filter:blur(8px);
      "></span>
      <span style="
        position:relative;
        display:flex;
        height:100%;
        width:100%;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:linear-gradient(135deg,#0f172a,#111827 58%,#0891b2);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.22);
      ">AI</span>
    `;

    Object.assign(button.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "55px",
      height: "55px",
      padding: "0",
      borderRadius: "50%",
      border: "0",
      background: "transparent",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: "999999",
      fontSize: "13px",
      fontWeight: "800",
      letterSpacing: "0",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      boxShadow: "0 16px 36px rgba(15,23,42,.28)",
      transition: "transform .18s ease, box-shadow .18s ease",
    });

    button.onmouseenter = () => {
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = "0 20px 44px rgba(15,23,42,.34)";
    };

    button.onmouseleave = () => {
      button.style.transform = "translateY(0)";
      button.style.boxShadow = "0 16px 36px rgba(15,23,42,.28)";
    };

    document.body.appendChild(button);

    const chatBox = document.createElement("div");

    Object.assign(chatBox.style, {
      position: "fixed",
      bottom: "90px",
      right: "20px",
      width: "320px",
      height: "420px",
      maxWidth: "calc(100vw - 40px)",
      maxHeight: "calc(100vh - 110px)",
      background: "#f8fafc",
      border: "1px solid rgba(148,163,184,.32)",
      borderRadius: "18px",
      display: "none",
      flexDirection: "column",
      zIndex: "999999",
      boxShadow: "0 24px 70px rgba(15,23,42,.24)",
      overflow: "hidden",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#0f172a",
    });

    chatBox.innerHTML = `
      <div style="
        padding:12px;
        background:linear-gradient(135deg,#0f172a,#111827 62%,#0891b2);
        color:#fff;
      ">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <div style="
              width:34px;
              height:34px;
              border-radius:12px;
              background:linear-gradient(135deg,#67e8f9,#22c55e);
              color:#0f172a;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:12px;
              font-weight:900;
              flex:0 0 auto;
            ">AI</div>
            <div style="min-width:0;">
              <div id="chat-header" style="
                font-size:14px;
                font-weight:800;
                line-height:1.2;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              ">AI Support</div>
              <div id="chat-status" style="
                margin-top:3px;
                display:flex;
                align-items:center;
                gap:6px;
                font-size:11px;
                color:rgba(255,255,255,.72);
              ">
                <span style="width:7px; height:7px; border-radius:50%; background:#22c55e;"></span>
                <span>Online now</span>
              </div>
            </div>
          </div>
          <button id="chat-close" type="button" aria-label="Close support chat" style="
            width:28px;
            height:28px;
            border:0;
            border-radius:9px;
            background:rgba(255,255,255,.12);
            color:#fff;
            cursor:pointer;
            font-size:18px;
            line-height:28px;
          ">&times;</button>
        </div>
      </div>

      <div id="chat-messages" style="
        flex:1;
        padding:14px;
        overflow-y:auto;
        background:
          radial-gradient(circle at top left, rgba(34,197,94,.08), transparent 28%),
          radial-gradient(circle at bottom right, rgba(8,145,178,.1), transparent 30%),
          #f8fafc;
      "></div>

      <div id="agent-timer" style="
        display:none;
        font-size:12px;
        color:#0369a1;
        background:#e0f2fe;
        border-top:1px solid #bae6fd;
        padding:7px 12px;
        font-weight:700;
      "></div>

      <div style="padding:10px; background:#fff; border-top:1px solid #e2e8f0;">
        <div style="
          display:flex;
          gap:8px;
          align-items:center;
          border:1px solid #e2e8f0;
          background:#f8fafc;
          border-radius:14px;
          padding:6px;
        ">
        <input id="chat-input" placeholder="Type your message..." 
          style="
            flex:1;
            min-width:0;
            border:none;
            background:transparent;
            padding:8px 6px;
            outline:none;
            color:#0f172a;
            font-size:13px;
          " />
        <button id="chat-send" 
          style="
            flex:0 0 auto;
            padding:8px 12px;
            border:none;
            border-radius:10px;
            background:#0f172a;
            color:#fff;
            font-size:12px;
            font-weight:800;
            cursor:pointer;
            box-shadow:0 8px 18px rgba(15,23,42,.18);
          ">
          Send
        </button>
        </div>
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
    const statusTextEl = chatBox.querySelector("#chat-status span:last-child");
    const closeBtn = chatBox.querySelector("#chat-close");

    closeBtn.onclick = () => {
      chatBox.style.display = "none";
    };

    function setHeader(mode) {
      if (!headerEl) return;
      if (mode === "agent") {
        headerEl.innerText = "Human Support";
        if (statusTextEl) statusTextEl.innerText = "Agent connected";
      } else {
        headerEl.innerText = "AI Support";
        if (statusTextEl) statusTextEl.innerText = "Online now";
      }
    }

    function addMessage(text, sender) {
      const msg = document.createElement("div");
      Object.assign(msg.style, {
        marginBottom: "10px",
        display: "flex",
        justifyContent: sender === "user" ? "flex-end" : "flex-start",
      });

      const bubble = document.createElement("span");

      let bg = "#fff";
      let color = "#334155";
      let radius = "16px 16px 16px 6px";
      let shadow = "0 6px 16px rgba(15,23,42,.08)";

      if (sender === "user") {
        bg = "linear-gradient(135deg,#0f172a,#111827)";
        color = "#fff";
        radius = "16px 16px 6px 16px";
        shadow = "0 8px 18px rgba(15,23,42,.16)";
      }

      if (sender === "agent") {
        bg = "linear-gradient(135deg,#059669,#16a34a)";
        color = "#fff";
        radius = "16px 16px 16px 6px";
        shadow = "0 8px 18px rgba(22,163,74,.16)";
      }

      Object.assign(bubble.style, {
        background: bg,
        color,
        padding: "8px 11px",
        borderRadius: radius,
        display: "inline-block",
        maxWidth: "80%",
        wordBreak: "break-word",
        fontSize: "13px",
        lineHeight: "1.42",
        boxShadow: shadow,
        border: sender === "bot" ? "1px solid rgba(226,232,240,.9)" : "0",
      });

      bubble.textContent = text;
      msg.appendChild(bubble);

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
    let agentJoinedNoticeShown = false;

    socket.off("receive_message");
    socket.off("agent_joined");
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

    socket.on("agent_joined", () => {
      stopAgentTimer();
      isAgentMode = true;
      setHeader("agent");

      if (agentJoinedNoticeShown) return;

      agentJoinedNoticeShown = true;
      addMessage("Agent is handling your chat. Please wait...", "bot");
    });

    socket.on("chat_ended_by_agent", (data) => {
      stopAgentTimer();
      isAgentMode = false;
      agentJoinedNoticeShown = false;
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
      const typingBubble = document.createElement("span");
      Object.assign(typingMsg.style, {
        marginBottom: "10px",
        display: "flex",
        justifyContent: "flex-start",
      });
      Object.assign(typingBubble.style, {
        background: "#fff",
        color: "#64748b",
        padding: "8px 11px",
        borderRadius: "16px 16px 16px 6px",
        display: "inline-block",
        fontSize: "13px",
        lineHeight: "1.42",
        boxShadow: "0 6px 16px rgba(15,23,42,.08)",
        border: "1px solid rgba(226,232,240,.9)",
      });
      typingBubble.textContent = "Typing...";
      typingMsg.appendChild(typingBubble);

      messagesDiv.appendChild(typingMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            ownerId,
            sessionId: sessionId.trim(),
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
          const isAgentHandlingReply =
            data.reply === "Agent is handling your chat. Please wait...";

          if (isAgentHandlingReply && isAgentMode) {
            lastBotMessage = data.reply;
          } else if (data.reply !== lastBotMessage) {
            lastBotMessage = data.reply;
            addMessage(data.reply, "bot");
          }
        }

        if (data.escalated) {
          startAgentTimer(120);
          socket.emit("request_human", { sessionId: sessionId.trim(), ownerId });
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
