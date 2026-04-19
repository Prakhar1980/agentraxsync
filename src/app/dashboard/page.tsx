export const dynamic = "force-dynamic";

import { getsession } from "@/lib/getsession";
import { redirect } from "next/navigation";
import DashboardClient from "../components/DashboardClient";

export default async function Page() {
  const session = await getsession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const ownerId = session.user.id;

  return <DashboardClient ownerId={ownerId} />;
}