const express = require("express");
const next = require("next");
const http = require("http");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare()
  .then(() => {
    const server = express();
    const httpServer = http.createServer(server);

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    globalThis.io = io;

    io.on("connection", (socket) => {
      console.log("⚡ Connected:", socket.id);

      socket.on("join", ({ sessionId, role, agentName, ownerId }) => {
        if (!sessionId || !role) return;

        socket.join(sessionId);

        if (ownerId) {
          socket.join(`owner:${ownerId}`);
        }

        if (role === "agent") {
          io.to(sessionId).emit("agent_joined", {
            name: agentName || "Support Agent",
          });
        }
      });

      socket.on("request_human", ({ sessionId, ownerId }) => {
        if (!sessionId || !ownerId) return;

        io.to(`owner:${ownerId}`).emit("new_chat_request", {
          sessionId,
          ownerId,
        });
      });

      socket.on("agent_accept", ({ sessionId, agentName }) => {
        if (!sessionId) return;

        socket.join(sessionId);

        io.to(sessionId).emit("agent_joined", {
          name: agentName || "Support Agent",
        });
      });

      socket.on("send_message", ({ sessionId, message, sender }) => {
        if (!sessionId || !message || !sender) return;

        io.to(sessionId).emit("receive_message", {
          message,
          sender,
        });
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
      });
    });

    server.all("*", (req, res) => handle(req, res));

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  });git add server.js