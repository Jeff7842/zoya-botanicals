import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { sha256 } from "@/lib/auth-utilis";

type VerifyStatus =
  | "success"
  | "expired"
  | "invalid"
  | "timeout"
  | "error"
  | "failed";

function generateMixedCaseToken(length = 64) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

async function createVerifyStateToken({
  status,
  userId,
  email,
}: {
  status: VerifyStatus;
  userId?: string | null;
  email?: string | null;
}) {
  const rawToken = generateMixedCaseToken(64);
  const tokenHash = sha256(rawToken);

  const { error } = await supabaseAdmin
    .schema("private")
    .from("verify_state_tokens")
    .insert({
      token_hash: tokenHash,
      status,
      user_id: userId ?? null,
      email: email ?? null,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

  if (error) {
    throw error;
  }

  return rawToken;
}

async function redirectWithVerifyToken({
  status,
  userId,
  email,
}: {
  status: VerifyStatus;
  userId?: string | null;
  email?: string | null;
}) {
  const verifyToken = await createVerifyStateToken({
    status,
    userId,
    email,
  });

  return NextResponse.redirect(
    `${process.env.APP_URL}/auth/verify?v=${encodeURIComponent(verifyToken)}`
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");

    if (!token || !uid) {
      return redirectWithVerifyToken({ status: "invalid", userId: uid });
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
      return redirectWithVerifyToken({ status: "invalid", userId: uid });
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (session.revoked_at || expiresAt <= now) {
      return redirectWithVerifyToken({ status: "expired", userId: uid });
    }

    const { error: updateUserError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uid);

    if (updateUserError) {
      return redirectWithVerifyToken({ status: "failed", userId: uid });
    }

    const { data: userRow } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("email")
      .eq("id", uid)
      .maybeSingle();

    const { error: authUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(uid, {
        email_confirm: true,
      });

    if (authUpdateError) {
      return redirectWithVerifyToken({
        status: "failed",
        userId: uid,
        email: userRow?.email ?? null,
      });
    }

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

    return redirectWithVerifyToken({
      status: "success",
      userId: uid,
      email: userRow?.email ?? null,
    });
  } catch (error) {
    console.error("verify error", error);
    return redirectWithVerifyToken({ status: "failed" });
  }
}