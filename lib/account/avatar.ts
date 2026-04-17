import { supabaseAdmin } from "@/lib/supabase/supabase";

export const ACCOUNT_AVATAR_BUCKET = "user_profile_photo";

function normalizeStoredImageValue(value: string | null | undefined) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized || normalized === "null" || normalized === "undefined") {
    return "";
  }

  return normalized;
}

function normalizeObjectPath(value: string) {
  if (value.startsWith(`${ACCOUNT_AVATAR_BUCKET}/`)) {
    return value.slice(ACCOUNT_AVATAR_BUCKET.length + 1);
  }

  return value;
}

function extractSupabaseObjectPath(value: string) {
  try {
    const url = new URL(value);
    const prefixes = [
      `/storage/v1/object/public/${ACCOUNT_AVATAR_BUCKET}/`,
      `/storage/v1/object/sign/${ACCOUNT_AVATAR_BUCKET}/`,
      `/storage/v1/object/authenticated/${ACCOUNT_AVATAR_BUCKET}/`,
    ];
    const matchedPrefix = prefixes.find((prefix) => url.pathname.startsWith(prefix));

    if (!matchedPrefix) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(matchedPrefix.length));
  } catch {
    return null;
  }
}

export function getStoredAccountAvatarObjectPath(value: string | null | undefined) {
  const normalized = normalizeStoredImageValue(value);

  if (!normalized) {
    return null;
  }

  return extractSupabaseObjectPath(normalized) ?? (!/^https?:\/\//i.test(normalized) ? normalizeObjectPath(normalized) : null);
}

async function createResolvedAvatarUrl(objectPath: string, fallbackUrl = "") {
  const normalizedPath = normalizeObjectPath(objectPath);
  const { data, error } = await supabaseAdmin.storage
    .from(ACCOUNT_AVATAR_BUCKET)
    .createSignedUrl(normalizedPath, 60 * 60);

  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(ACCOUNT_AVATAR_BUCKET).getPublicUrl(normalizedPath);

  return publicUrl || fallbackUrl;
}

export async function resolveAccountAvatarUrl(value: string | null | undefined) {
  const normalized = normalizeStoredImageValue(value);

  if (!normalized || normalized.startsWith("/")) {
    return normalized;
  }

  const objectPath = getStoredAccountAvatarObjectPath(normalized);

  if (!objectPath) {
    return normalized;
  }

  return createResolvedAvatarUrl(objectPath, normalized);
}

export function sanitizeAccountAvatarFolderSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
