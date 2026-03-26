import { Suspense } from "react";
import VerifiedUserView from "./VerifiedUserView";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { sha256 } from "@/lib/auth-utilis";

type StatusKey =
  | "success"
  | "expired"
  | "invalid"
  | "timeout"
  | "error"
  | "failed";

async function resolveVerifyStatus(
  rawToken?: string
): Promise<StatusKey> {
  if (!rawToken) return "failed";

  const tokenHash = sha256(rawToken);
  const nowIso = new Date().toISOString();

  const { data: freshRow, error: freshError } = await supabaseAdmin
    .schema("private")
    .from("verify_state_tokens")
    .update({
      used_at: nowIso,
    })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", nowIso)
    .select("status")
    .maybeSingle();

  if (freshRow) {
    return (freshRow.status as StatusKey) ?? "failed";
  }

  const { data: existingRow, error: existingError } = await supabaseAdmin
    .schema("private")
    .from("verify_state_tokens")
    .select("status, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (existingError || !existingRow) return "failed";

  if (existingRow.used_at) return "invalid";

  if (new Date(existingRow.expires_at).getTime() <= Date.now()) {
    return "expired";
  }

  return "failed";
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const params = await searchParams;
  const status = await resolveVerifyStatus(params?.v);

  return (
    <Suspense fallback={null}>
      <VerifiedUserView status={status} />
    </Suspense>
  );
}