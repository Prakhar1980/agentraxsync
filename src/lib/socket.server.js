import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    global.io = io;

    io.on("connection", (socket) => {
      console.log("⚡ Connected:", socket.id);

      socket.on("join", ({ sessionId, role, agentName, ownerId }) => {
        if (!sessionId || !role) return;

        socket.join(sessionId);

        socket.data.sessionId = sessionId;
        socket.data.role = role;
        socket.data.agentName = agentName || null;
        socket.data.ownerId = ownerId || null;

        if (ownerId) {
          socket.join(`owner:${ownerId}`);
        }

        console.log(`➡ ${role} joined room: ${sessionId}`);

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
  }

  return io;
}