import { getsession } from "@/lib/getsession";
import { redirect } from "next/navigation";
import InboxClient from "./InboxClient";

export default async function Page() {
  const session = await getsession();

  if (!session?.user?.id) {
    redirect("/");
  }

  return <InboxClient />;
}