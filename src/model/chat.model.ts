import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
  role: { type: String, enum: ["user", "bot", "agent"], required: true },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema(
  {
    ownerId: { type: String, required: true },

    sessionId: { type: String, required: true }, // each user chat session

    messages: [MessageSchema],

    escalated: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["AI", "HUMAN"],
      default: "AI",
    },
  },
  { timestamps: true }
);

const Chat = models.Chat || model("Chat", ChatSchema);

export default Chat;