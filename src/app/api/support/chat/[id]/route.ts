import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const chat = await Chat.findById(id).lean();

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("Fetch Chat Error:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}