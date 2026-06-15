import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HOSTING_SUFFIXES = [
  ".vercel.app",
  ".netlify.app",
  ".herokuapp.com",
  ".github.io",
  ".railway.app",
];

function getSubdomain(hostname: string): string | null {
  const rootDomain = process.env.ROOT_DOMAIN?.toLowerCase();

  if (rootDomain) {
    if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
      return null;
    }
    const suffix = `.${rootDomain}`;
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length);
      return sub && sub !== "www" ? sub : null;
    }
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const sub = hostname.replace(/\.localhost$/, "");
    return sub || null;
  }

  for (const suffix of HOSTING_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return null;
    }
  }

  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0];
  }

  return null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();
  const subdomain = getSubdomain(hostname);

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
