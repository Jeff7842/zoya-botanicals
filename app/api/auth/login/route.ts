import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { getIpAddress, getUserAgent } from "@/lib/auth-utilis";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";

type LoginBody = {
  email: string;
  password: string;
  turnstileToken: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const turnstileToken = body.turnstileToken?.trim();

    if (!email || !password || !turnstileToken) {
      return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
    }

    const ip = getIpAddress(req);
    const userAgent = getUserAgent(req);

    const turnstile = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstile.success) {
      return NextResponse.json(
        { error: "Security verification failed." },
        { status: 400 },
      );
    }

    const { data: appUser, error: appUserError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("id, email, verified, login_count")
      .eq("email", email)
      .maybeSingle();

    if (appUserError || !appUser) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!appUser.verified) {
      return NextResponse.json(
        { error: "Verify your email before login." },
        { status: 403 },
      );
    }

    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: signInData, error: signInError } =
      await supabasePublic.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.user || !signInData.session) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Track successful login
    await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        last_login_ip: ip,
        last_login_at: new Date().toISOString(),
        login_count: (appUser.login_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appUser.id);

    // Optional: add a normal login session row too
    await supabaseAdmin
      .schema("private")
      .from("sessions")
      .insert({
        user_id: appUser.id,
        session_token: signInData.session.access_token,
        ip_address: ip,
        user_agent: userAgent,
        is_active: true,
        expires_at: new Date(signInData.session.expires_at! * 1000).toISOString(),
        turnstile_verified: true,
        turnstile_verified_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      session: signInData.session,
      user: signInData.user,
    });
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}