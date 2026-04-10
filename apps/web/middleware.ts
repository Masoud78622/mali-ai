import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  
  // Dynamically determine the root domain based on the request host
  let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (!rootDomain || rootDomain === "undefined") {
    rootDomain = host.includes("localhost") ? "localhost:3000" : "mali-ai.shop";
  }

  // Force apex domain to fix Vercel www. environmental bugs
  rootDomain = rootDomain.replace("www.", "");
  const cleanHost = host.replace("www.", "");

  // If we are on the base domain, just proceed normally
  if (cleanHost === rootDomain || cleanHost === "localhost:3000") {
    return NextResponse.next();
  }
  
  // If it's a subdomain, rewrite to /store/[subdomain]
  if (cleanHost.endsWith(`.${rootDomain}`)) {
    const subdomain = cleanHost.replace(`.${rootDomain}`, "");
    // Prevent double-rewriting static assets
    if (subdomain && !req.nextUrl.pathname.startsWith("/_next")) {
      console.log(`🌀 Rewriting ${cleanHost} to /store/${subdomain}`);
      return NextResponse.rewrite(new URL(`/store/${subdomain}${req.nextUrl.pathname}`, req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };