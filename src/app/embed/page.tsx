import { getsession } from "@/lib/getsession";
import EmbedClient from "@/app/components/EmbedClient";
import React from "react";
import DashboardClient from "../components/DashboardClient";

export default async function Page() {
  const session = await getsession();

  return (
    <>
   
      <EmbedClient ownerId ={session?.user?.id!}/>
    </>
  );
}
