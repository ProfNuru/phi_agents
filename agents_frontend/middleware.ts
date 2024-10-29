import { type NextRequest, NextResponse } from "next/server"
import { publicRoutes } from "./routes"
import { verifySession } from "./lib/session";

export default async function middleware(req:NextRequest) {
    const currentPath = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);

    if(!isPublicRoute){
        const verified = await verifySession();
        if(!verified){
            return NextResponse.redirect(new URL('/', req.nextUrl))
        }
        // console.log({verified});
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image).*)']
}
