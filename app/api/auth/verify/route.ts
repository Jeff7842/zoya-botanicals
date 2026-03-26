import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { sha256 } from "@/lib/auth-utilis";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");

    if (!token || !uid) {
      return NextResponse.redirect(`${process.env.APP_URL}/auth/verify?status=invalid`);
    }

    const tokenHash = sha256(token);

    const { data: session, error: sessionError } = await supabaseAdmin
      .schema("private")
      .from("sessions")
      .select("*")
      .eq("user_id", uid)
      .eq("session_token", tokenHash)
      .eq("is_active", true)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.redirect(`${process.env.APP_URL}/auth/verify?status=invalid`);
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (session.revoked_at || expiresAt <= now) {
      return NextResponse.redirect(`${process.env.APP_URL}/auth/verify?status=expired`);
    }

    // mark app user verified
    const { error: updateUserError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uid);

    if (updateUserError) {
      return NextResponse.redirect(`${process.env.APP_URL}/auth/verify?status=failed`);
    }

    // confirm auth email too
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(uid, {
      email_confirm: true,
    });

    if (authUpdateError) {
      return NextResponse.redirect(`${process.env.APP_URL}/auth/verify?status=failed`);
    }

    // immediately end the first verification session
    await supabaseAdmin
      .schema("private")
      .from("sessions")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        expires_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    return NextResponse.redirect(`${process.env.APP_URL}/auth/verify?status=success`);
  } catch (error) {
    console.error("verify error", error);
    return NextResponse.redirect(`${process.env.APP_URL}/auth/verify?status=failed`);
  }
}