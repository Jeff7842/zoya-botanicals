import "server-only";

import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import type { AuthenticatedZoyaUser } from "@/lib/auth/login-otp";

type PrivateUserRow = {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  verified: boolean | null;
};

function splitName(name: string | null | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const firstName = parts[0] ?? null;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;

  return { firstName, lastName };
}

function displayName(user: PrivateUserRow) {
  return user.username ?? user.first_name ?? user.email;
}

async function getPrivateUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .schema("private")
    .from("users")
    .select("id, email, username, first_name, verified")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PrivateUserRow | null;
}

async function getPrivateUserById(userId: string) {
  const { data, error } = await supabaseAdmin
    .schema("private")
    .from("users")
    .select("id, email, username, first_name, verified")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PrivateUserRow | null;
}

function toAuthenticatedUser(user: PrivateUserRow): AuthenticatedZoyaUser {
  return {
    id: user.id,
    email: user.email,
    name: displayName(user),
    username: user.username,
    firstName: user.first_name,
    rememberMe: false,
  };
}

export async function resolveOAuthUser(params: {
  email: string;
  name?: string | null;
  provider: string;
  ipAddress?: string | null;
}) {
  const email = params.email.trim().toLowerCase();
  const existingUser = await getPrivateUserByEmail(email);
  const now = new Date().toISOString();

  if (existingUser) {
    const { firstName } = splitName(params.name);

    await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        verified: true,
        first_name: existingUser.first_name ?? firstName,
        last_login_ip: params.ipAddress ?? null,
        last_login_at: now,
        updated_at: now,
      })
      .eq("id", existingUser.id);

    return toAuthenticatedUser({
      ...existingUser,
      first_name: existingUser.first_name ?? firstName,
      verified: true,
    });
  }

  const { firstName, lastName } = splitName(params.name);
  const password = crypto.randomBytes(36).toString("base64url");

  const { data: createdUserData, error: createUserError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        auth_provider: params.provider,
      },
    });

  if (createUserError || !createdUserData.user) {
    throw createUserError ?? new Error("Could not create OAuth user.");
  }

  const userId = createdUserData.user.id;
  const userPatch = {
    email,
    first_name: firstName,
    last_name: lastName,
    ip_address: params.ipAddress ?? null,
    last_login_ip: params.ipAddress ?? null,
    last_login_at: now,
    verified: true,
    updated_at: now,
  };

  const { error: updateError } = await supabaseAdmin
    .schema("private")
    .from("users")
    .update(userPatch)
    .eq("id", userId);

  if (updateError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw updateError;
  }

  const savedUser = await getPrivateUserById(userId);

  if (!savedUser) {
    const { error: insertError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .insert({
        id: userId,
        ...userPatch,
      });

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw insertError;
    }
  }

  const user = (await getPrivateUserById(userId)) ?? {
    id: userId,
    email,
    username: null,
    first_name: firstName,
    verified: true,
  };

  return toAuthenticatedUser(user);
}
