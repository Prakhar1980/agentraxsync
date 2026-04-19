import express from "express";
import next from "next";
import http from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

// ✅ Render uses dynamic PORT
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("⚡ user connected:", socket.id);

    socket.on("join", ({ sessionId }) => {
      if (!sessionId) return;

      socket.join(sessionId);
      console.log("✅ joined room:", sessionId);
    });

    socket.on("send_message", ({ sessionId, message }) => {
      if (!sessionId || !message) return;

      io.to(sessionId).emit("receive_message", {
        message,
        sender: "user",
      });
    });

    socket.on("agent_message", ({ sessionId, message }) => {
      if (!sessionId || !message) return;

      io.to(sessionId).emit("receive_message", {
        message,
        sender: "agent",
      });
    });

    socket.on("agent_join", ({ sessionId, agentName }) => {
      if (!sessionId) return;

      io.to(sessionId).emit("agent_joined", {
        name: agentName || "Support Agent",
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ disconnected:", socket.id);
    });
  });

  server.all("*", (req, res) => handle(req, res));

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});