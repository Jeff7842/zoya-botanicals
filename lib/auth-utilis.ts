import crypto from "crypto";

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getIpAddress(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return null;
}

export function getUserAgent(req: Request) {
  return req.headers.get("user-agent") ?? null;
}