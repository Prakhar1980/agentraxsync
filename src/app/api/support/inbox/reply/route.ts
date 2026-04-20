import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }

    const chatId = body?.chatId?.toString?.().trim?.();
    const message = body?.message?.toString?.().trim?.();
    const sessionId = body?.sessionId?.toString?.().trim?.();
    const skipRealtime = Boolean(body?.skipRealtime);

    if (!chatId || !message || !sessionId) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const chat: any = await Chat.findById(chatId);

    if (!chat) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    if (chat.sessionId && chat.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "session mismatch" },
        { status: 400 }
      );
    }

    await Chat.findByIdAndUpdate(chatId, {
      $push: {
        messages: {
          role: "agent",
          text: message,
          createdAt: new Date(),
        },
      },
      $set: {
        status: "HUMAN",
        escalated: true,
        awaitingConfirmation: false,
        lastSeen: new Date(),
      },
    });

    const io = global.io;

    if (!io) {
      console.log("❌ SOCKET NOT READY (server not running)");
      return NextResponse.json({
        success: true,
        warning: "socket not connected",
      });
    }

    if (!skipRealtime) {
      io.to(sessionId).emit("receive_message", {
        message,
        sender: "agent",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
