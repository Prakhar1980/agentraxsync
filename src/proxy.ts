//middleware
import {NextRequest, NextResponse} from "next/server";
import { getsession } from "@/lib/getsession";
export async function proxy(req :NextRequest){
    const session = await getsession()
    if(!session){
         return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`)
}
return NextResponse.next()
}


export const config = {
  matcher: '/dashboard/:path*',
}