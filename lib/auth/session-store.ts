import "server-only";

import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/supabase";

export const AUTH_SESSION_MAX_AGE_SECONDS = 30 * 60;

const REVOKED_SESSION_DELETE_AFTER_SECONDS = 10 * 60;
const SESSION_TOUCH_INTERVAL_SECONDS = 60;

export type CreateUserSessionResult =
  | {
      ok: true;
      sessionToken: string;
      expiresAt: string;
    }
  | {
      ok: false;
      reason: "active_session" | "database_error";
      message: string;
    };

function nowIso() {
  return new Date().toISOString();
}

function isoFromNow(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function nullableIpAddress(ipAddress: string | null | undefined) {
  if (!ipAddress || ipAddress === "unknown") return null;
  return ipAddress;
}

export async function cleanupAuthSessions() {
  const now = nowIso();
  const deleteBefore = new Date(
    Date.now() - REVOKED_SESSION_DELETE_AFTER_SECONDS * 1000,
  ).toISOString();

  await supabaseAdmin
    .schema("private")
    .from("sessions")
    .update({
      is_active: false,
      revoked_at: now,
      expires_at: now,
      last_seen_at: now,
    })
    .eq("is_active", true)
    .lte("expires_at", now);

  await supabaseAdmin
    .schema("private")
    .from("sessions")
    .delete()
    .not("revoked_at", "is", null)
    .lte("revoked_at", deleteBefore);
}

export async function hasActiveUserSession(
  userId: string,
  currentSessionToken?: string | null,
) {
  await cleanupAuthSessions();

  const { data, error } = await supabaseAdmin
    .schema("private")
    .from("sessions")
    .select("session_token")
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("revoked_at", null)
    .gt("expires_at", nowIso());

  if (error) {
    console.error("active session lookup error", error);
    return false;
  }

  return Boolean(
    data?.some((session) => session.session_token !== currentSessionToken),
  );
}

export async function createUserSession(params: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  turnstileVerified?: boolean;
  turnstileVerifiedAt?: string | null;
}): Promise<CreateUserSessionResult> {
  const hasActiveSession = await hasActiveUserSession(params.userId);

  if (hasActiveSession) {
    return {
      ok: false,
      reason: "active_session",
      message:
        "This account already has an active session. Please log out on that device before signing in again.",
    };
  }

  const expiresAt = isoFromNow(AUTH_SESSION_MAX_AGE_SECONDS);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const sessionToken = crypto.randomBytes(48).toString("hex");
    const { error } = await supabaseAdmin
      .schema("private")
      .from("sessions")
      .insert({
        user_id: params.userId,
        session_token: sessionToken,
        ip_address: nullableIpAddress(params.ipAddress),
        user_agent: params.userAgent ?? null,
        is_active: true,
        last_seen_at: nowIso(),
        expires_at: expiresAt,
        turnstile_verified: params.turnstileVerified ?? false,
        turnstile_verified_at: params.turnstileVerifiedAt ?? null,
      });

    if (!error) {
      return {
        ok: true,
        sessionToken,
        expiresAt,
      };
    }

    if (error.code !== "23505") {
      console.error("create user session error", error);
      return {
        ok: false,
        reason: "database_error",
        message: error.message,
      };
    }
  }

  return {
    ok: false,
    reason: "database_error",
    message: "Could not create a unique session token.",
  };
}

export async function touchUserSession(params: {
  sessionToken: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await cleanupAuthSessions();

  const { data: session, error } = await supabaseAdmin
    .schema("private")
    .from("sessions")
    .select("id, is_active, expires_at, revoked_at, last_seen_at")
    .eq("session_token", params.sessionToken)
    .maybeSingle();

  if (error || !session || !session.is_active || session.revoked_at) {
    return { ok: false as const };
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await revokeUserSession(params.sessionToken);
    return { ok: false as const };
  }

  const lastSeenAt = new Date(session.last_seen_at).getTime();
  const shouldTouch =
    Date.now() - lastSeenAt >= SESSION_TOUCH_INTERVAL_SECONDS * 1000;

  if (!shouldTouch) {
    return {
      ok: true as const,
      expiresAt: session.expires_at as string,
    };
  }

  const expiresAt = isoFromNow(AUTH_SESSION_MAX_AGE_SECONDS);
  const updatedAt = nowIso();

  const { error: updateError } = await supabaseAdmin
    .schema("private")
    .from("sessions")
    .update({
      last_seen_at: updatedAt,
      expires_at: expiresAt,
      ip_address: nullableIpAddress(params.ipAddress),
      user_agent: params.userAgent ?? null,
    })
    .eq("session_token", params.sessionToken)
    .eq("is_active", true);

  if (updateError) {
    console.error("touch user session error", updateError);
    return { ok: false as const };
  }

  return {
    ok: true as const,
    expiresAt,
  };
}

export async function revokeUserSession(sessionToken: string | null | undefined) {
  if (!sessionToken) return;

  const revokedAt = nowIso();

  await supabaseAdmin
    .schema("private")
    .from("sessions")
    .update({
      is_active: false,
      revoked_at: revokedAt,
      last_seen_at: revokedAt,
      expires_at: isoFromNow(REVOKED_SESSION_DELETE_AFTER_SECONDS),
    })
    .eq("session_token", sessionToken);

  await cleanupAuthSessions();
}

export async function createVerificationSession(params: {
  userId: string;
  sessionToken: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string;
  turnstileVerified: boolean;
  turnstileVerifiedAt?: string | null;
}) {
  await cleanupAuthSessions();

  return supabaseAdmin.schema("private").from("sessions").insert({
    user_id: params.userId,
    session_token: params.sessionToken,
    ip_address: nullableIpAddress(params.ipAddress),
    user_agent: params.userAgent ?? null,
    is_active: true,
    expires_at: params.expiresAt,
    turnstile_verified: params.turnstileVerified,
    turnstile_verified_at: params.turnstileVerifiedAt ?? null,
  });
}
