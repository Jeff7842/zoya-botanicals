import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveAccountAvatarUrl } from "@/lib/account/avatar";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import {
  USERNAME_CHANGE_LIMIT,
  USERNAME_CHANGE_WINDOWS_DAYS,
  type AccountProfile,
  type UsernamePolicy,
} from "@/lib/account/shared";

type AccountUserRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  username: string;
  img_url: string | null;
  verified: boolean;
  phone: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
};

type UsernamePolicyRow = {
  can_change_now: boolean;
  changes_remaining: number;
  next_allowed_at: string | null;
};

type UsernameChangeRow = {
  changed_at: string;
  previous_username: string;
  new_username: string;
  cooldown_days: number;
  next_allowed_at: string;
};

function toDisplayName(firstName: string, lastName: string, username: string) {
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || username;
}

function toInitials(firstName: string, lastName: string, username: string) {
  const source = `${firstName} ${lastName}`.trim() || username;

  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "Z"
  );
}

function isMissingRelationError(error: { code?: string; message?: string } | null, relationName: string) {
  return Boolean(
    error &&
      (error.code === "PGRST205" ||
        new RegExp(relationName, "i").test(error.message ?? "") ||
        /Could not find the table/i.test(error.message ?? "")),
  );
}

function buildUsernamePolicy(
  policy: UsernamePolicyRow | null,
  logs: UsernameChangeRow[],
  policyTableInstalled: boolean,
  auditLogInstalled: boolean,
): UsernamePolicy {
  if (policyTableInstalled && policy) {
    const changesRemaining = Math.max(0, policy.changes_remaining);
    const changesUsed = auditLogInstalled ? logs.length : 0;
    const maxChanges = Math.max(changesRemaining + changesUsed, changesRemaining);

    return {
      canChangeNow: policy.can_change_now && changesRemaining > 0,
      changesUsed,
      changesRemaining,
      maxChanges,
      nextAllowedAt: policy.next_allowed_at ?? logs[0]?.next_allowed_at ?? null,
      nextCooldownDays:
        changesRemaining > 0
          ? USERNAME_CHANGE_WINDOWS_DAYS[Math.min(changesUsed, USERNAME_CHANGE_WINDOWS_DAYS.length - 1)]
          : null,
      currentCooldownDays: logs[0]?.cooldown_days ?? null,
      migrationInstalled: true,
      policyTableInstalled: true,
      auditLogInstalled,
    };
  }

  const changesUsed = logs.length;
  const changesRemaining = Math.max(0, USERNAME_CHANGE_LIMIT - changesUsed);
  const latest = logs[0];
  const now = Date.now();
  const nextAllowedAt = latest?.next_allowed_at ?? null;
  const canChangeNow =
    auditLogInstalled &&
    changesUsed < USERNAME_CHANGE_LIMIT &&
    (!nextAllowedAt || new Date(nextAllowedAt).getTime() <= now);
  const nextCooldownDays =
    changesUsed >= USERNAME_CHANGE_LIMIT
      ? null
      : USERNAME_CHANGE_WINDOWS_DAYS[Math.min(changesUsed, USERNAME_CHANGE_WINDOWS_DAYS.length - 1)];

  return {
    canChangeNow,
    changesUsed,
    changesRemaining,
    maxChanges: USERNAME_CHANGE_LIMIT,
    nextAllowedAt,
    nextCooldownDays,
    currentCooldownDays: latest?.cooldown_days ?? null,
    migrationInstalled: auditLogInstalled,
    policyTableInstalled,
    auditLogInstalled,
  };
}

async function getUsernameChangeLogs(userId: string) {
  const { data, error } = await supabaseAdmin
    .schema("private")
    .from("username_change_log")
    .select("changed_at, previous_username, new_username, cooldown_days, next_allowed_at")
    .eq("user_id", userId)
    .order("changed_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error, "username_change_log")) {
      return {
        logs: [] as UsernameChangeRow[],
        auditLogInstalled: false,
      };
    }

    throw new Error(error.message);
  }

  return {
    logs: (data ?? []) as UsernameChangeRow[],
    auditLogInstalled: true,
  };
}

async function getUsernamePolicyRow(userId: string) {
  const { data, error } = await supabaseAdmin
    .schema("private")
    .from("username_policy")
    .select("can_change_now, changes_remaining, next_allowed_at")
    .eq("user_id", userId)
    .maybeSingle<UsernamePolicyRow>();

  if (error) {
    if (isMissingRelationError(error, "username_policy")) {
      return {
        policy: null as UsernamePolicyRow | null,
        policyTableInstalled: false,
      };
    }

    throw new Error(error.message);
  }

  if (data) {
    return {
      policy: data,
      policyTableInstalled: true,
    };
  }

  const { data: createdPolicy, error: createError } = await supabaseAdmin
    .schema("private")
    .from("username_policy")
    .upsert(
      {
        user_id: userId,
      },
      { onConflict: "user_id" },
    )
    .select("can_change_now, changes_remaining, next_allowed_at")
    .single<UsernamePolicyRow>();

  if (createError) {
    if (isMissingRelationError(createError, "username_policy")) {
      return {
        policy: null as UsernamePolicyRow | null,
        policyTableInstalled: false,
      };
    }

    throw new Error(createError.message);
  }

  return {
    policy: createdPolicy,
    policyTableInstalled: true,
  };
}

export async function getAccountProfile(userId: string): Promise<AccountProfile> {
  const { data, error } = await supabaseAdmin
    .schema("private")
    .from("users")
    .select(`
  id,
  email,
  first_name,
  last_name,
  username,
  img_url,
  verified,
  phone,
  country,
  city,
  created_at
`)
    .eq("id", userId)
    .maybeSingle<AccountUserRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Account profile not found.");
  }

  const [{ logs, auditLogInstalled }, { policy, policyTableInstalled }] = await Promise.all([
    getUsernameChangeLogs(userId),
    getUsernamePolicyRow(userId),
  ]);
  const firstName = data.first_name ?? "";
  const lastName = data.last_name ?? "";
  const phone = data.phone ?? "";
  const country = data.country ?? "";
  const city = data.city ?? "";
  const displayName = toDisplayName(firstName, lastName, data.username);

  return {
    id: data.id,
    email: data.email,
    firstName,
    lastName,
    username: data.username,
    imageUrl: await resolveAccountAvatarUrl(data.img_url),
    verified: data.verified,
    phone,
    country,
    city,
    createdAt: data.created_at,
    displayName,
    initials: toInitials(firstName, lastName, data.username),
    usernamePolicy: buildUsernamePolicy(policy, logs, policyTableInstalled, auditLogInstalled),
  };
}

export async function requireAccountProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return getAccountProfile(session.user.id);
}
