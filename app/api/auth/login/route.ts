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

const MAX_ATTEMPTS_PER_MINUTE = 10;
const MAX_ATTEMPTS_PER_FIVE_MINUTES = 15;
const FAILED_ATTEMPTS_BEFORE_COOLDOWN = 10;
const FAILED_COOLDOWN_SECONDS = 60;

function secondsUntil(date: Date) {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 1000));
}

async function recordLoginAttempt(params: {
  email: string;
  ip: string;
  userAgent: string;
  success: boolean;
}) {
  const { email, ip, userAgent, success } = params;

  await supabaseAdmin.schema("private").from("login_attempts").insert({
    email,
    ip_address: ip,
    user_agent: userAgent,
    success,
    attempted_at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const turnstileToken = body.turnstileToken?.trim();

    if (!email || !password || !turnstileToken) {
      return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
    }

    const ip = getIpAddress(req) ?? "unknown";
const userAgent = getUserAgent(req) ?? "unknown";

    const turnstile = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstile.success) {
      return NextResponse.json(
        { error: "Security verification failed." },
        { status: 400 },
      );
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // Pull recent attempts for this email
    const { data: recentAttempts, error: recentAttemptsError } = await supabaseAdmin
      .schema("private")
      .from("login_attempts")
      .select("success, attempted_at")
      .eq("email", email)
      .gte("attempted_at", fiveMinutesAgo)
      .order("attempted_at", { ascending: false });

    if (recentAttemptsError) {
      console.error("recentAttemptsError", recentAttemptsError);
      return NextResponse.json(
        { error: "Unable to validate login limits right now." },
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

    // 1) Block after too many attempts in 1 minute
    if (attemptsLastMinute >= MAX_ATTEMPTS_PER_MINUTE) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please wait before trying again.",
          code: "RATE_LIMIT_1_MINUTE",
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

    // 2) Block after too many attempts in 5 minutes
    if (attemptsLastFiveMinutes >= MAX_ATTEMPTS_PER_FIVE_MINUTES) {
      return NextResponse.json(
        {
          error: "Too many login attempts in the last 5 minutes. Please try again later.",
          code: "RATE_LIMIT_5_MINUTES",
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

    // 3) Cooldown after 10 failed attempts
    if (failedAttemptsLastFiveMinutes.length >= FAILED_ATTEMPTS_BEFORE_COOLDOWN) {
      const newestFailedAttempt = new Date(failedAttemptsLastFiveMinutes[0].attempted_at);
      const cooldownEndsAt = new Date(
        newestFailedAttempt.getTime() + FAILED_COOLDOWN_SECONDS * 1000,
      );

      if (cooldownEndsAt.getTime() > now.getTime()) {
        const retryAfterSeconds = secondsUntil(cooldownEndsAt);

        return NextResponse.json(
          {
            error: `Too many failed logins. Try again in ${retryAfterSeconds} seconds.`,
            code: "FAILED_ATTEMPT_COOLDOWN",
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

    const { data: appUser, error: appUserError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("id, email, verified, login_count")
      .eq("email", email)
      .maybeSingle();

    if (appUserError || !appUser) {
      await recordLoginAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!appUser.verified) {
      await recordLoginAttempt({
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
      await recordLoginAttempt({
        email,
        ip,
        userAgent,
        success: false,
      });

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await recordLoginAttempt({
      email,
      ip,
      userAgent,
      success: true,
    });

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