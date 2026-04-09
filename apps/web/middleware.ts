import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const protocol = req.headers.get("x-forwarded-proto") || "http";

  // Force HTTPS in production
  if (protocol === "http" && !host.includes("localhost")) {
    return NextResponse.redirect(`https://${host}${req.nextUrl.pathname}${req.nextUrl.search}`);
  }
  
  // Dynamically determine the root domain based on the request host
  let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (!rootDomain || rootDomain === "undefined") {
    rootDomain = host.includes("localhost") ? "localhost:3000" : "mali-ai.shop";
  }

  // Force apex domain to fix Vercel www. environmental bugs
  rootDomain = rootDomain.replace("www.", "");
  const cleanHost = host.replace("www.", "");

  if (cleanHost === rootDomain) return NextResponse.next();
  
  if (cleanHost.endsWith(`.${rootDomain}`)) {
    const subdomain = cleanHost.split(".")[0];
    return NextResponse.rewrite(new URL(`/store/${subdomain}${req.nextUrl.pathname}`, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };