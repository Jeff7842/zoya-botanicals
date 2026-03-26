import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/supabase";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("zoya_session")?.value;

  if (sessionToken) {
    await supabaseAdmin
      .schema("private")
      .from("sessions")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq("session_token", sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("zoya_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}