import{NextRequest , NextResponse} from "next/server";
import { scalekit } from "@/lib/scalekit";

export async function GET(req:NextRequest) {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  const authUrl =scalekit.getAuthorizationUrl(redirectUri) //get authorize url
  return NextResponse.redirect(authUrl);//redirect to url
}//login api