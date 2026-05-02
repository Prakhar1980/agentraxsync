export const dynamic = "force-dynamic";

import { getsession } from "@/lib/getsession";
import { redirect } from "next/navigation";
import DashboardClient from "@/app/components/DashboardClient";

export default async function Page() {
  const session = await getsession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const ownerId = session.user.id;

  return (
    <>
      <div className="fixed bottom-3 right-3 z-[10000] rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-lg">
         DASHBOARD UI
      </div>
      <DashboardClient ownerId={ownerId} />
    </>
  );
}
