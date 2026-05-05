// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const session = req.cookies.get("appwrite-session");

  // No session + trying to access protected route → send to login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Has session + trying to access auth pages → send to dashboard
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Run middleware on every route except Next.js internals and static files
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
