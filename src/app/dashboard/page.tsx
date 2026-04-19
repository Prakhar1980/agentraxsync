import { getsession } from "@/lib/getsession";
import DashboardClient from "../components/DashboardClient";

export default async function Page() {
  const session = await getsession();

  const ownerId = session?.user?.id || null;

  return (
    <DashboardClient ownerId={ownerId} />
  );
}