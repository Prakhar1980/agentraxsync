import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";

export async function GET() {
  try {
    await connectDB();

    const chats = await Chat.find({ escalated: true }).sort({ createdAt: -1 });

    return NextResponse.json(chats);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load inbox" },
      { status: 500 }
    );
  }
}