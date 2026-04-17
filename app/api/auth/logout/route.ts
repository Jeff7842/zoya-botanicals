import { NextResponse } from "next/server";
import { signOut } from "@/auth";

function clearLegacySessionCookie(response: NextResponse) {
  response.cookies.set("zoya_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  await signOut({ redirect: false });

  const response = NextResponse.json({ success: true });
  clearLegacySessionCookie(response);

  return response;
}
