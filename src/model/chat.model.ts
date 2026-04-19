import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ["user", "bot", "agent"],
    required: true,
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },

    messages: [MessageSchema],
    status: {
      type: String,
      enum: ["AI", "HUMAN", "WAITING_FOR_AGENT", "AWAITING_CONFIRMATION", "ENDED"],
      default: "AI",
      index: true,
    },

    escalated: { type: Boolean, default: false, index: true },

    awaitingConfirmation: { type: Boolean, default: false, index: true },

    agentRequestedAt: { type: Date, default: null },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now, index: true },
    ended: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);
ChatSchema.index({ ownerId: 1, sessionId: 1 }, { unique: true });

const Chat = models.Chat || model("Chat", ChatSchema);

export default Chat;