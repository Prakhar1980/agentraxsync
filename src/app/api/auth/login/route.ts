import { NextRequest, NextResponse } from "next/server";
import { scalekit } from "@/lib/scalekit";

export async function GET(req: NextRequest) {
  if (!scalekit) {
    return NextResponse.json(
      { error: "Scalekit not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  const authUrl = scalekit.getAuthorizationUrl(redirectUri);
  return NextResponse.redirect(authUrl);
}