import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allow static + public pages + auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  // protect these areas
  const protectedPath =
    pathname.startsWith("/micro-skill-practice") || pathname.startsWith("/exam");

  if (!protectedPath) return NextResponse.next();

  const cookie = req.cookies.get("spv_session")?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/micro-skill-practice/:path*", "/exam/:path*"],
};
