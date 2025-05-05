"use server";

import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];
const PUBLIC_ROUTES_REGEX = new RegExp(`^(${PUBLIC_ROUTES.join("|")})$`);

export default async function Authorized({ request, auth }: { request: NextRequest; auth: Session | null }) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') 
  ) {
    return true;
  }

  console.log("Auth check for path:", pathname, auth);

  if (auth && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  } else if (!auth && !PUBLIC_ROUTES.includes(pathname) && !PUBLIC_ROUTES_REGEX.test(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return true;
}