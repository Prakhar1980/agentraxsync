import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId, ownerId } = await req.json();

    if (!sessionId || !ownerId) {
      return NextResponse.json(
        { error: "sessionId and ownerId required" },
        { status: 400 }
      );
    }

    await Chat.updateOne(
      { ownerId, sessionId },
      {
        $set: {
          ended: true,
          status: "AI", // ✅ return control to AI instead of ENDED
          escalated: false,
          awaitingConfirmation: false,
          isOnline: false,
          lastSeen: new Date(),
        },
      }
    );

    // ✅ Notify user immediately
    global.io?.to(sessionId).emit("chat_ended_by_agent", {
      message: "Agent ended the chat. AI will assist you now.",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}