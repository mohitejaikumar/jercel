import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";

export default async function middleware(req) {
  const cookie = req.cookies.get("next-auth.session-token")?.value;

  const isAuthenticated = cookie ? true : false;
  const pathSegments = req.nextUrl.pathname.split("/");

  if (!isAuthenticated && pathSegments[1] == "projects") {
    const loginPath = `/auth/signin`;
    const loginURL = new URL(loginPath, req.nextUrl.origin);
    return NextResponse.redirect(loginURL.toString());
  }
  if (
    (isAuthenticated && pathSegments[2] == "signin") ||
    (isAuthenticated && pathSegments[1] == "signup")
  ) {
    const newURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(newURL.toString());
  }
  return NextResponse.next();
}
