import { getsession } from "@/lib/getsession";
import EmbedClient from "@/app/components/EmbedClient";

export const dynamic = "force-dynamic"; // ✅ FIX

export default async function Page() {
  const session = await getsession();

  return <EmbedClient ownerId={session?.user?.id || ""} />;
}