import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { getAccountProfile } from "@/lib/account/profile";
import { formatDateTime, USERNAME_CHANGE_WINDOWS_DAYS } from "@/lib/account/shared";

type ProfileUpdateBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  username?: string;
};

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeOptional(value: string) {
  return value.length > 0 ? value : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUsername(value: string) {
  return /^[a-zA-Z0-9._-]{3,30}$/.test(value);
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as ProfileUpdateBody;
    const firstName = cleanValue(body.firstName);
    const lastName = cleanValue(body.lastName);
    const email = cleanValue(body.email).toLowerCase();
    const phone = cleanValue(body.phone);
    const country = cleanValue(body.country);
    const city = cleanValue(body.city);
    const username = cleanValue(body.username);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!username || !isValidUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters and use only letters, numbers, dots, underscores, or hyphens." },
        { status: 400 },
      );
    }

    const currentProfile = await getAccountProfile(session.user.id);
    const usernameChanged = username !== currentProfile.username;
    const policy = currentProfile.usernamePolicy;

    if (usernameChanged) {
      if (!policy.migrationInstalled) {
        return NextResponse.json(
          { error: "Username edits are not available until the username policy table is ready for this account." },
          { status: 503 },
        );
      }

      if (policy.changesRemaining <= 0) {
        return NextResponse.json(
          { error: "You have reached the maximum number of username changes for this account." },
          { status: 403 },
        );
      }

      if (!policy.canChangeNow) {
        return NextResponse.json(
          {
            error: `Your username is locked until ${formatDateTime(policy.nextAllowedAt)}.`,
          },
          { status: 403 },
        );
      }
    }

    const { data: usernameOwner, error: usernameOwnerError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", session.user.id)
      .maybeSingle();

    if (usernameOwnerError) {
      return NextResponse.json({ error: usernameOwnerError.message }, { status: 500 });
    }

    if (usernameOwner) {
      return NextResponse.json({ error: "That username is already in use." }, { status: 409 });
    }

    const { error: profileError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        first_name: sanitizeOptional(firstName),
        last_name: sanitizeOptional(lastName),
        email,
        phone: sanitizeOptional(phone),
        country: sanitizeOptional(country),
        city: sanitizeOptional(city),
        username,
      })
      .eq("id", session.user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(session.user.id, {
      email,
      user_metadata: {
        first_name: sanitizeOptional(firstName),
        last_name: sanitizeOptional(lastName),
        username,
      },
    });

    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 400 });
    }

    if (usernameChanged && !policy.policyTableInstalled && policy.auditLogInstalled) {
      const cooldownDays = USERNAME_CHANGE_WINDOWS_DAYS[Math.min(policy.changesUsed, USERNAME_CHANGE_WINDOWS_DAYS.length - 1)];
      const now = new Date();
      const nextAllowedAt = new Date(now.getTime() + cooldownDays * 24 * 60 * 60 * 1000).toISOString();

      const { error: usernameLogError } = await supabaseAdmin
        .schema("private")
        .from("username_change_log")
        .insert({
          user_id: session.user.id,
          previous_username: currentProfile.username,
          new_username: username,
          cooldown_days: cooldownDays,
          next_allowed_at: nextAllowedAt,
        });

      if (usernameLogError) {
        return NextResponse.json({ error: usernameLogError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: usernameChanged ? "Profile updated. Your username change has been saved." : "Profile updated successfully.",
    });
  } catch (error) {
    console.error("account profile update error", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
