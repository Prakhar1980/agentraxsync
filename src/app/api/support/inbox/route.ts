import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const chats = await Chat.find({
    status: "HUMAN",
    escalated: true,
  }).sort({ createdAt: -1 });

  return NextResponse.json(chats);
}