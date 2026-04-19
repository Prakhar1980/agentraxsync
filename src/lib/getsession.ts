import { cookies } from "next/headers";
import { scalekit } from "@/lib/scalekit";

export async function getsession() {
  try {
    const session = cookies();
    const token = session.get("access_token")?.value;

    if (!token || !scalekit) {
      return null;
    }

    const result: any = await scalekit.validateToken(token);

    let user = null;

    try {
      user = await scalekit.user.getUser(result.sub);
    } catch (err) {
      console.log("⚠️ Scalekit user not found");
      user = null; 
    }

    return user;
  } catch (err) {
    console.log("❌ Session error:", err);
    return null;
  }
}
