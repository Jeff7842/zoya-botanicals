import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { getIpAddress, getUserAgent } from "@/lib/auth-utilis";

type VerifyOtpBody = {
  email: string;
  otp: string;
  rememberMe?: boolean;
};

const MAX_ATTEMPTS_PER_MINUTE = 10;
const MAX_ATTEMPTS_PER_FIVE_MINUTES = 15;
const FAILED_ATTEMPTS_BEFORE_COOLDOWN = 10;
const FAILED_COOLDOWN_SECONDS = 60;

function secondsUntil(date: Date) {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 1000));
}

async function recordOtpVerifyAttempt(params: {
  email: string;
  ip: string;
  userAgent: string;
  success: boolean;
}) {
  const { email, ip, userAgent, success } = params;

  await supabaseAdmin.schema("private").from("otp_verify_attempts").insert({
    email,
    ip_address: ip,
    user_agent: userAgent,
    success,
    attempted_at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyOtpBody;

    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();
    const rememberMe = Boolean(body.rememberMe);

    if (!email || !otp || otp.length !== 6) {
      return NextResponse.json(
        { error: "Valid OTP is required." },
        { status: 400 },
      );
    }

    const ip = getIpAddress(req) ?? "unknown";
    const userAgent = getUserAgent(req) ?? "unknown";

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    const { data: recentAttempts, error: attemptsError } = await supabaseAdmin
      .schema("private")
      .from("otp_verify_attempts")
      .select("success, attempted_at")
      .eq("email", email)
      .gte("attempted_at", fiveMinutesAgo)
      .order("attempted_at", { ascending: false });

    if (attemptsError) {
      console.error("otp attemptsError", attemptsError);
      return NextResponse.json(
        { error: "Unable to validate OTP attempt limits right now." },
        { status: 500 },
      );
    }

    const attemptsLastMinute =
      recentAttempts?.filter(
        (attempt) => new Date(attempt.attempted_at).getTime() >= now.getTime() - 60 * 1000,
      ).length ?? 0;

    const attemptsLastFiveMinutes = recentAttempts?.length ?? 0;

    const failedAttemptsLastFiveMinutes =
      recentAttempts?.filter((attempt) => !attempt.success) ?? [];

    if (attemptsLastMinute >= MAX_ATTEMPTS_PER_MINUTE) {
      return NextResponse.json(
        {
          error: "Too many OTP attempts. Please wait before trying again.",
          code: "OTP_RATE_LIMIT_1_MINUTE",
          retryAfterSeconds: 60,
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        },
      );
    }

    if (attemptsLastFiveMinutes >= MAX_ATTEMPTS_PER_FIVE_MINUTES) {
      return NextResponse.json(
        {
          error: "Too many OTP attempts in the last 5 minutes. Please try again later.",
          code: "OTP_RATE_LIMIT_5_MINUTES",
          retryAfterSeconds: 300,
        },
        {
          status: 429,
          headers: {
            "Retry-After": "300",
          },
        },
      );
    }

    if (failedAttemptsLastFiveMinutes.length >= FAILED_ATTEMPTS_BEFORE_COOLDOWN) {
      const newestFailedAttempt = new Date(failedAttemptsLastFiveMinutes[0].attempted_at);
      const cooldownEndsAt = new Date(
        newestFailedAttempt.getTime() + FAILED_COOLDOWN_SECONDS * 1000,
      );

      if (cooldownEndsAt.getTime() > now.getTime()) {
        const retryAfterSeconds = secondsUntil(cooldownEndsAt);

        return NextResponse.json(
          {
            error: `Too many failed OTP attempts. Try again in ${retryAfterSeconds} seconds.`,
            code: "OTP_FAILED_ATTEMPT_COOLDOWN",
            retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfterSeconds),
            },
          },
        );
      }
    }

    const { data: user, error: userError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("id, username, email, verified, login_count")
      .eq("email", email)
      .maybeSingle();

    if (userError || !user) {
      await recordOtpVerifyAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    if (!user.verified) {
      await recordOtpVerifyAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: "Verify your email before login." },
        { status: 403 },
      );
    }

    const { data: otpRow, error: otpError } = await supabaseAdmin
      .schema("private")
      .from("otps")
      .select("id, otp_code, otp_used, expires_at")
      .eq("user_id", user.id)
      .eq("otp_purpose", "login_2fa")
      .eq("otp_used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRow) {
      await recordOtpVerifyAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: "OTP not found or expired." },
        { status: 400 },
      );
    }

    const currentTime = Date.now();
    const otpExpiresAt = new Date(otpRow.expires_at).getTime();

    if (otpRow.otp_code !== otp || otpRow.otp_used || otpExpiresAt <= currentTime) {
      await recordOtpVerifyAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: "Invalid or expired OTP." },
        { status: 400 },
      );
    }

    const { error: markOtpError } = await supabaseAdmin
      .schema("private")
      .from("otps")
      .update({
        otp_used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id", otpRow.id);

    if (markOtpError) {
      await recordOtpVerifyAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: "Could not complete OTP verification." },
        { status: 400 },
      );
    }

    const rawSessionToken = crypto.randomBytes(48).toString("hex");
    const expiresAtIso = new Date(
      Date.now() + (rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24 * 7),
    ).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .schema("private")
      .from("sessions")
      .insert({
        user_id: user.id,
        session_token: rawSessionToken,
        ip_address: ip,
        user_agent: userAgent,
        is_active: true,
        expires_at: expiresAtIso,
        turnstile_verified: false,
        turnstile_verified_at: null,
      });

    if (sessionError) {
      await recordOtpVerifyAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: sessionError.message },
        { status: 400 },
      );
    }

    const { error: updateUserError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        last_login_ip: ip,
        last_login_at: new Date().toISOString(),
        login_count: (user.login_count ?? 0) + 1,
      })
      .eq("id", user.id);

    if (updateUserError) {
      return NextResponse.json(
        { error: "Login succeeded but user profile update failed." },
        { status: 400 },
      );
    }

    await recordOtpVerifyAttempt({
      email,
      ip,
      userAgent,
      success: true,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    response.cookies.set("zoya_session", rawSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAtIso),
    });

    return response;
  } catch (error) {
    console.error("verify otp error", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}