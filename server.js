import express from "express";
import next from "next";
import http from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("⚡ user connected:", socket.id);

    socket.on("join", ({ sessionId }) => {
      if (!sessionId) return;

      socket.join(sessionId);
      console.log(" joined room:", sessionId);
    });

    socket.on("send_message", ({ sessionId, message }) => {
      io.to(sessionId).emit("receive_message", {
        message,
        sender: "user",
      });
    });

    socket.on("agent_message", ({ sessionId, message }) => {
      io.to(sessionId).emit("receive_message", {
        message,
        sender: "agent",
      });
    });

    socket.on("agent_join", ({ sessionId, agentName }) => {
      io.to(sessionId).emit("agent_joined", {
        name: agentName || "Support Agent",
      });
    });

    socket.on("disconnect", () => {
      console.log(" disconnected:", socket.id);
    });
  });

  server.use((req, res) => handle(req, res));

  httpServer.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
});