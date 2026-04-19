import { cookies } from "next/headers";
import { scalekit } from "@/lib/scalekit";
export async function getsession(){
     try{    //for find session
      const session = await cookies()
      const token = session.get("access_token")?.value;
      if(!token){
        return null 
      }
         
      const result:any = await scalekit.validateToken(token)
      const user = await scalekit.user.getUser(result.sub)
      return user
      }
      catch(err){
        console.log(err)
      }

}
