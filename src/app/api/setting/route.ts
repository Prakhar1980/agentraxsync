import connectDB from "@/lib/db";
import Settings from "@/model/setting.model";
import { NextResponse } from "next/server";

// ✅ GET SETTINGS (fetch by ownerId)
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
      return NextResponse.json(
        { error: "ownerId is required" },
        { status: 400 }
      );
    }

    const settings = await Settings.findOne({ ownerId });

    return NextResponse.json(settings || {});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// ✅ POST SETTINGS (create or update)
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
   const { ownerId, buisenessName, supportEmail, knowledge } = body;

    if (!ownerId) {
      return NextResponse.json(
        { error: "ownerId is required" },
        { status: 400 }
      );
    }

    const settings = await Settings.findOneAndUpdate(
      { ownerId },
      { ownerId, buisenessName, supportEmail, knowledge },
      { returnDocument: "after", upsert: true }
    );

    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}