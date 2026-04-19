import { Server, Socket } from "socket.io";
import Chat from "@/model/chat.model";
import { startChatCleanup } from "@/lib/chatCleanup";

let io: Server;

export function initSocket(server: any) {
  if (!io) {
    io = new Server(server, {
      cors: { origin: "*" },
    });
    global.io = io;

    startChatCleanup();

    io.on("connection", (socket: Socket) => {
      console.log("⚡ Connected:", socket.id);

      socket.on("join", async ({ sessionId, role, agentName, ownerId }) => {
        try {
          if (!sessionId || !role) {
            console.log(" Missing sessionId or role");
            return;
          }

          socket.join(sessionId);

          socket.data.sessionId = sessionId;
          socket.data.role = role;
          socket.data.agentName = agentName || null;
          socket.data.ownerId = ownerId || null;

          if (ownerId) {
            socket.join(`owner:${ownerId}`);
          }

          console.log(`➡ ${role} joined room: ${sessionId}`);

          if (role === "user") {
            if (!ownerId) {
              console.log(" User joined without ownerId");
              return;
            }

            await Chat.updateOne(
              { ownerId, sessionId },
              {
                $set: {
                  ownerId,
                  sessionId,
                  isOnline: true,
                  ended: false,
                  lastSeen: new Date(),
                },
              },
              { upsert: true }
            );
          }

          if (role === "agent") {
            if (!ownerId) {
              console.log(" Agent joined without ownerId");
              return;
            }

            const chat = await Chat.findOne({ ownerId, sessionId }).lean();

            if (chat?.status === "HUMAN") return;

            io.to(sessionId).emit("agent_joined", {
              name: agentName || "Support Agent",
            });

            await Chat.updateOne(
              { ownerId, sessionId },
              {
                $set: {
                  status: "HUMAN",
                  escalated: true,
                  awaitingConfirmation: false,
                  lastSeen: new Date(),
                },
              }
            );
          }
        } catch (err) {
          console.error("join error:", err);
        }
      });
      socket.on("request_human", async ({ sessionId, ownerId }) => {
        try {
          if (!sessionId || !ownerId) return;

          io.to(`owner:${ownerId}`).emit("new_chat_request", {
            sessionId,
            ownerId,
          });

          await Chat.updateOne(
            { ownerId, sessionId },
            {
              $set: {
                status: "WAITING_FOR_AGENT",
                escalated: true,
                agentRequestedAt: new Date(),
                ended: false,
                lastSeen: new Date(),
              },
            }
          );
        } catch (err) {
          console.error("request_human error:", err);
        }
      });
      socket.on("agent_accept", async ({ sessionId, agentName, ownerId }) => {
        try {
          if (!sessionId || !ownerId) return;

          socket.join(sessionId);

          io.to(sessionId).emit("agent_joined", {
            name: agentName || "Support Agent",
          });

          await Chat.updateOne(
            { ownerId, sessionId },
            {
              $set: {
                status: "HUMAN",
                escalated: true,
                awaitingConfirmation: false,
                ended: false,
                lastSeen: new Date(),
              },
            }
          );
        } catch (err) {
          console.error("agent_accept error:", err);
        }
      });
      socket.on("send_message", async ({ sessionId, message, sender, ownerId }) => {
        try {
          if (!sessionId || !message || !sender) return;

          io.to(sessionId).emit("receive_message", {
            message,
            sender,
          });

          if (ownerId) {
            await Chat.updateOne(
              { ownerId, sessionId },
              {
                $push: {
                  messages: {
                    role: sender,
                    text: message,
                    createdAt: new Date(),
                  },
                },
                $set: {
                  lastSeen: new Date(),
                  ended: false,
                },
              }
            );
          }
        } catch (err) {
          console.error("send_message error:", err);
        }
      });
      socket.on("disconnect", async () => {
        console.log(" Disconnected:", socket.id);

        const sessionId = socket.data.sessionId;
        const ownerId = socket.data.ownerId;
        const role = socket.data.role;

        if (sessionId && ownerId && role === "user") {
          setTimeout(async () => {
            try {
              await Chat.updateOne(
                { ownerId, sessionId },
                {
                  $set: {
                    isOnline: false,
                  },
                }
              );

              console.log("⚫ Marked offline:", sessionId);
            } catch (err) {
              console.error("disconnect update error:", err);
            }
          }, 5000);
        }
      });
    });
  }

  return io;
}