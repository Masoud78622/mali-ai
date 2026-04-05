import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  if (host === rootDomain || host === `www.${rootDomain}`) return NextResponse.next();
  if (host.endsWith(`.${rootDomain}`)) {
    const subdomain = host.split(".")[0];
    return NextResponse.rewrite(new URL(`/store/${subdomain}${req.nextUrl.pathname}`, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };