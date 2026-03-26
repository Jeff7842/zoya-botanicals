import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/auth/signup/verify-pending") {
    const hasPendingAccess =
      request.cookies.get("zoya_verify_pending_access")?.value === "granted";

    if (!hasPendingAccess) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/signup/verify-pending"],
};