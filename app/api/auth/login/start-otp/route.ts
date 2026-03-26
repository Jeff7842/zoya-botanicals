import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { getIpAddress, getUserAgent } from "@/lib/auth-utilis";
import { sendLoginOtpEmail } from "@/lib/email/otp";

type LoginStartBody = {
  email: string;
  password: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginStartBody;

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const ip = getIpAddress(req);
    const userAgent = getUserAgent(req);

    const { data: appUser, error: appUserError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("id, email, first_name, username, verified, login_count")
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

    const { error: signInError } = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const { data: otpRow, error: otpError } = await supabaseAdmin
      .schema("private")
      .from("otps")
      .insert({
        user_id: appUser.id,
        otp_purpose: "login_2fa",
        sent_to: email,
        ip_address: ip,
        turnstile_verified: false,
        turnstile_verified_at: null,
      })
      .select("id, otp_code, expires_at")
      .single();

    if (otpError || !otpRow) {
      return NextResponse.json(
        { error: otpError?.message ?? "Could not generate OTP." },
        { status: 400 },
      );
    }

    const { error: emailError } = await sendLoginOtpEmail({
      to: email,
      firstName: appUser.first_name,
      otpCode: otpRow.otp_code,
    });

    if (emailError) {
      return NextResponse.json(
        { error: "Could not send OTP email." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      userId: appUser.id,
      email: appUser.email,
      username: appUser.username,
      expiresAt: otpRow.expires_at,
      userAgent,
    });
  } catch (error) {
    console.error("login start otp error", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}