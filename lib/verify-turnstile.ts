export async function verifyTurnstileToken(token: string, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing TURNSTILE_SECRET_KEY");
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip) {
    formData.append("remoteip", ip);
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Turnstile verification failed");
  }

  const data = await res.json();

  return {
    success: Boolean(data.success),
    hostname: data.hostname ?? null,
    action: data.action ?? null,
    challenge_ts: data.challenge_ts ?? null,
    errorCodes: data["error-codes"] ?? [],
  };
}