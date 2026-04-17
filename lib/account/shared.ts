export const USERNAME_CHANGE_LIMIT = 5;
export const USERNAME_CHANGE_WINDOWS_DAYS = [3, 6, 14, 30, 30] as const;

export type UsernamePolicy = {
  canChangeNow: boolean;
  changesUsed: number;
  changesRemaining: number;
  maxChanges: number;
  nextAllowedAt: string | null;
  nextCooldownDays: number | null;
  currentCooldownDays: number | null;
  migrationInstalled: boolean;
  policyTableInstalled: boolean;
  auditLogInstalled: boolean;
};

export type AccountProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string;
  verified: boolean;
  phone: string;
  country: string;
  city: string;
  createdAt: string;
  displayName: string;
  initials: string;
  usernamePolicy: UsernamePolicy;
};

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Available now";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
