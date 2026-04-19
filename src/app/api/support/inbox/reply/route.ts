import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  const { chatId, message } = await req.json();

  await Chat.findByIdAndUpdate(chatId, {
    $push: {
      messages: {
        role: "human",
        text: message,
      },
    },
  });

  return NextResponse.json({ success: true });
}