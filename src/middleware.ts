import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reserved top-level paths that are NOT company workspaces.
const RESERVED = new Set(["", "login", "signup", "onboarding", "admin", "api", "go"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";
  const res = NextResponse.next();
  // For /{slug}/... workspace routes, remember the active company for server actions.
  if (!RESERVED.has(seg) && !seg.includes(".")) {
    res.cookies.set("keel_slug", seg, { sameSite: "lax", path: "/" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
