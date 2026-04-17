import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revokeAllUserSessions } from "@/lib/auth/session-store";
import { applyNoStoreHeaders, clearAuthCookies } from "@/lib/auth/session-response";

export async function POST() {
  const session = await auth();

  if (session?.user?.id) {
    await revokeAllUserSessions(session.user.id);
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return applyNoStoreHeaders(response);
}
