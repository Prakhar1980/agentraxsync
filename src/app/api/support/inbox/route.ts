import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const ownerId = req.nextUrl.searchParams.get("ownerId");

    const filter: any = ownerId ? { ownerId } : {};

    // 🔥 Mark inactive users offline (10 min)
    await Chat.updateMany(
      {
        ...filter,
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
      ...filter,
      ended: true,
      updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // 🔥 Return escalated chats
    const chats = await Chat.find({
      ...filter,
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