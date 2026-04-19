import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { getsession } from "@/lib/getsession";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    //  SESSION CHECK (IMPORTANT)
    const session = await getsession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownerId = session.user.id;

    await connectDB();

    // 🔥 Mark inactive users offline (10 min)
    await Chat.updateMany(
      {
        ownerId,
        lastSeen: { $lt: new Date(Date.now() - 10 * 60 * 1000) },
        ended: { $ne: true },
        status: { $nin: ["WAITING_FOR_AGENT", "HUMAN"] },
      },
      {
        $set: {
          isOnline: false,
        },
      }
    );

    // CLEAN ENDED chats older than 24h
    await Chat.deleteMany({
      ownerId,
      ended: true,
      updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    //  Return escalated chats
    const chats = await Chat.find({
      ownerId,
      ended: { $ne: true },
      $or: [
        { status: "WAITING_FOR_AGENT" },
        { status: "HUMAN" },
        { awaitingConfirmation: true },
        { escalated: true },
      ],
    })
      .sort({ lastSeen: -1 })
      .lean();

    const res = NextResponse.json(chats);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Inbox Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}