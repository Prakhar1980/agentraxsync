(function () {
  // 🔹 GET SCRIPT TAG
  const scriptTag = document.currentScript;

  // 🔹 OWNER ID
  const ownerId =
    scriptTag?.getAttribute("data-owner-id") ||
    window.CHATBOT_OWNER_ID;

  if (!ownerId) {
    console.error("❌ ownerId not found in script tag");
    return;
  }

  // 🔹 DYNAMIC API URL (SAAS READY)
  const API_URL =
    scriptTag?.getAttribute("data-api-url") ||
    window.CHATBOT_API_URL ||
    "http://localhost:3000/api/chat";

  // 🔥 SESSION ID (IMPORTANT FOR SAAS)
  let sessionId = localStorage.getItem("agentrax_session");

  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2);
    localStorage.setItem("agentrax_session", sessionId);
  }

  // 🔹 CREATE BUTTON
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
    zIndex: "9999",
    fontSize: "22px",
  });

  document.body.appendChild(button);

  // 🔹 CHAT BOX
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
    zIndex: "9999",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  });

  chatBox.innerHTML = `
    <div style="padding:10px; background:#000; color:#fff; border-radius:12px 12px 0 0;">
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

  // 🔹 TOGGLE CHAT
  button.onclick = () => {
    chatBox.style.display =
      chatBox.style.display === "none" ? "flex" : "none";
  };

  const messagesDiv = chatBox.querySelector("#chat-messages");
  const input = chatBox.querySelector("#chat-input");
  const sendBtn = chatBox.querySelector("#chat-send");

  // 🔹 ADD MESSAGE UI
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
        word-wrap:break-word;
      ">
        ${text}
      </span>
    `;

    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // 🔹 SEND MESSAGE
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          ownerId,
          sessionId, // 🔥 IMPORTANT FOR SAAS
        }),
      });

      const data = await res.json();

      addMessage(data.reply || "No response", "bot");

      if (data.escalated) {
        addMessage("🧑‍💼 Connecting to human agent...", "bot");
      }
    } catch (err) {
      console.error(err);
      addMessage("Server error ❌", "bot");
    }
  }

  sendBtn.onclick = sendMessage;

  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });
})();