import { NextResponse } from "next/server";

const AUTH_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "zoya_session",
  "zoya_verify_pending_access",
] as const;

export function applyNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  for (const cookieName of AUTH_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}
