import{NextRequest , NextResponse} from "next/server";
import { cookies } from "next/headers";

export async function GET(req:NextRequest) {
    const cookiestore = await cookies()
    cookiestore.delete("access_token")

     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`)
}