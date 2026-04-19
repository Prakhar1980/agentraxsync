import { cookies } from "next/headers";
import { scalekit } from "@/lib/scalekit";

export async function getsession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token || !scalekit) {
      return null;
    }

    const result: any = await scalekit.validateToken(token);

    
    try {
      await scalekit.user.getUser(result.sub);
    } catch (err) {
      console.log("⚠️ Scalekit user not found");
      return null;
    }

    return {
      user: {
        id: result.sub,
      },
    };
  } catch (err) {
    console.log("❌ Session error:", err);
    return null;
  }
}