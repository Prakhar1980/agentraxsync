import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";


export async function GET() {
  await connectDB();

  const chats = await Chat.find({
    status: "HUMAN",
    escalated: true,
  }).sort({ updatedAt: -1 });

  return NextResponse.json(chats);
}