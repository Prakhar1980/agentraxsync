import HomeClient from "./components/HomeClient";
import { getsession } from "@/lib/getsession";

export const dynamic = "force-dynamic";

export default async function Home() {
  
  const session = await  getsession()
 

  return (
    <>
    <HomeClient email={session?.user?.email!}/>
    </>
  
  );
}
