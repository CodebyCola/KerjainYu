import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/lib/routes";

const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!hasSession && !isAuthRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
