import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  const parts = hostname.split(".");
  let subdomain: string | null = null;

  if (parts.length >= 2 && parts[0] !== "localhost" && parts[0] !== "www") {
    subdomain = parts[0];
  } else if (parts.length >= 3) {
    subdomain = parts[0];
  }

  if (!subdomain) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (!pathname.startsWith(`/s/${subdomain}`)) {
    url.pathname = `/s/${subdomain}${pathname === "/" ? "/login" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
