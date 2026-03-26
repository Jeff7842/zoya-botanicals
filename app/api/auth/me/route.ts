import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/supabase";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("zoya_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false });
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .schema("private")
    .from("sessions")
    .select("id, user_id, is_active, expires_at")
    .eq("session_token", sessionToken)
    .eq("is_active", true)
    .maybeSingle();

  if (sessionError || !session) {
    return NextResponse.json({ authenticated: false });
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ authenticated: false });
  }

  const { data: user, error: userError } = await supabaseAdmin
    .schema("private")
    .from("users")
    .select("id, username, first_name, email")
    .eq("id", session.user_id)
    .maybeSingle();

  if (userError || !user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}