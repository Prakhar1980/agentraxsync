export const dynamic = "force-dynamic";

import { getsession } from "@/lib/getsession";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";

export default async function Page() {
  const session = await getsession();

  if (!session?.user?.id) {
    redirect("/");
  }

  return <ChatClient />;
}