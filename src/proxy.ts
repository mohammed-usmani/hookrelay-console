import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIES } from "@/lib/session-cookies";

/** Fast redirect for signed-out visitors. The real check happens when the API call is made. */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const admin = pathname.startsWith("/admin");
  const cookie = admin ? SESSION_COOKIES.admin : SESSION_COOKIES.app;
  if (req.cookies.has(cookie)) return NextResponse.next();
  const url = new URL(admin ? "/admin/sign-in" : "/sign-in", req.url);
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!sign-in|admin/sign-in|_next|favicon.ico|icon.svg).*)"],
};
