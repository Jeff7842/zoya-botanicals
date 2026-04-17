import "server-only";

import { supabaseAdmin } from "@/lib/supabase/supabase";
import { hasActiveUserSession } from "@/lib/auth/session-store";

const MAX_ATTEMPTS_PER_MINUTE = 10;
const MAX_ATTEMPTS_PER_FIVE_MINUTES = 15;
const FAILED_ATTEMPTS_BEFORE_COOLDOWN = 10;
const FAILED_COOLDOWN_SECONDS = 60;

export type AuthenticatedZoyaUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  firstName: string | null;
  rememberMe: boolean;
};

export type VerifyLoginOtpResult =
  | {
      ok: true;
      user: AuthenticatedZoyaUser;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

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

export async function verifyLoginOtp(params: {
  email: string;
  otp: string;
  ip: string;
  userAgent: string;
  rememberMe: boolean;
}): Promise<VerifyLoginOtpResult> {
  const { email, otp, ip, userAgent, rememberMe } = params;
  const now = new Date();
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
    return {
      ok: false,
      error: "Unable to validate OTP attempt limits right now.",
      status: 500,
    };
  }

  const attemptsLastMinute =
    recentAttempts?.filter(
      (attempt) =>
        new Date(attempt.attempted_at).getTime() >=
        now.getTime() - 60 * 1000,
    ).length ?? 0;

  const attemptsLastFiveMinutes = recentAttempts?.length ?? 0;
  const failedAttemptsLastFiveMinutes =
    recentAttempts?.filter((attempt) => !attempt.success) ?? [];

  if (attemptsLastMinute >= MAX_ATTEMPTS_PER_MINUTE) {
    return {
      ok: false,
      error: "Too many OTP attempts. Please wait before trying again.",
      status: 429,
    };
  }

  if (attemptsLastFiveMinutes >= MAX_ATTEMPTS_PER_FIVE_MINUTES) {
    return {
      ok: false,
      error:
        "Too many OTP attempts in the last 5 minutes. Please try again later.",
      status: 429,
    };
  }

  if (failedAttemptsLastFiveMinutes.length >= FAILED_ATTEMPTS_BEFORE_COOLDOWN) {
    const newestFailedAttempt = new Date(
      failedAttemptsLastFiveMinutes[0].attempted_at,
    );
    const cooldownEndsAt = new Date(
      newestFailedAttempt.getTime() + FAILED_COOLDOWN_SECONDS * 1000,
    );

    if (cooldownEndsAt.getTime() > now.getTime()) {
      const retryAfterSeconds = secondsUntil(cooldownEndsAt);

      return {
        ok: false,
        error: `Too many failed OTP attempts. Try again in ${retryAfterSeconds} seconds.`,
        status: 429,
      };
    }
  }

  const { data: user, error: userError } = await supabaseAdmin
    .schema("private")
    .from("users")
    .select("id, username, first_name, email, verified, login_count")
    .eq("email", email)
    .maybeSingle();

  if (userError || !user) {
    await recordOtpVerifyAttempt({
      email,
      ip,
      userAgent,
      success: false,
    });

    return {
      ok: false,
      error: "User not found.",
      status: 404,
    };
  }

  if (!user.verified) {
    await recordOtpVerifyAttempt({
      email,
      ip,
      userAgent,
      success: false,
    });

    return {
      ok: false,
      error: "Verify your email before login.",
      status: 403,
    };
  }

  const hasActiveSession = await hasActiveUserSession(user.id);

  if (hasActiveSession) {
    return {
      ok: false,
      error:
        "This account is already signed in on another device. Log out there before signing in again.",
      status: 409,
    };
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

    return {
      ok: false,
      error: "OTP not found or expired.",
      status: 400,
    };
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

    return {
      ok: false,
      error: "Invalid or expired OTP.",
      status: 400,
    };
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

    return {
      ok: false,
      error: "Could not complete OTP verification.",
      status: 400,
    };
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
    return {
      ok: false,
      error: "Login succeeded but user profile update failed.",
      status: 400,
    };
  }

  await recordOtpVerifyAttempt({
    email,
    ip,
    userAgent,
    success: true,
  });

  const name = user.username ?? user.first_name ?? user.email;

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name,
      username: user.username,
      firstName: user.first_name,
      rememberMe,
    },
  };
}
