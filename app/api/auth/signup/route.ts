import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase";
import { resend } from "@/lib/resend";
import { generateVerificationToken, getIpAddress, getUserAgent, sha256 } from "@/lib/auth-utilis";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";
import { createVerificationSession } from "@/lib/auth/session-store";

type SignupBody = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  password: string;
  turnstileToken: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SignupBody;

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const country = body.country?.trim();
    const city = body.city?.trim();
    const password = body.password;
    const turnstileToken = body.turnstileToken?.trim();
    const isTurnstileDisabled = process.env.DISABLE_TURNSTILE === "true";
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !country ||
      !city ||
      !password ||
      (!isTurnstileDisabled && !turnstileToken)
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const ip = getIpAddress(req);
    const userAgent = getUserAgent(req);
    

    if (!isTurnstileDisabled) {
  const turnstile = await verifyTurnstileToken(turnstileToken, ip);

  if (!turnstile.success) {
    return NextResponse.json(
      { error: "Security verification failed." },
      { status: 400 },
    );
  }
}

    // 1) create auth user
    const { data: createdUserData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (createUserError || !createdUserData.user) {
      return NextResponse.json(
        { error: createUserError?.message ?? "Could not create user." },
        { status: 400 },
      );
    }

    const userId = createdUserData.user.id;

    // 2) insert into private.users
    const { error: profileError } = await supabaseAdmin
  .schema("private")
  .from("users")
  .update({
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
    country,
    city,
    ip_address: ip,
    verified: false,
  })
  .eq("id", userId);

    if (profileError) {
      // rollback auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }

    // 3) create one-time verification session
    const rawToken = generateVerificationToken();
    const tokenHash = sha256(rawToken);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 mins

    const { error: sessionError } = await createVerificationSession({
      userId,
      sessionToken: tokenHash,
      ipAddress: ip,
      userAgent,
      expiresAt,
      turnstileVerified: !isTurnstileDisabled,
      turnstileVerifiedAt: !isTurnstileDisabled
        ? new Date().toISOString()
        : null,
    });

    if (sessionError) {
      await supabaseAdmin
        .schema("private")
        .from("users")
        .delete()
        .eq("id", userId);

      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: sessionError.message },
        { status: 400 },
      );
    }

    // 4) send custom verification email
    const appUrl = (process.env.APP_URL ?? new URL(req.url).origin).trim();
    const verifyUrl =
      `${appUrl}/api/auth/verify?token=${encodeURIComponent(rawToken)}&uid=${encodeURIComponent(userId)}`;

    const { error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Verify your ZOYA account",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>Verify your email</h2>
          <p>Hello ${firstName},</p>
          <p>Welcome to ZOYA Botanicals. Click the button below to verify your account.</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#34058d;color:#fff;text-decoration:none;border-radius:10px;">
              Verify Account
            </a>
          </p>
          <p>This verification link will expire in 30 minutes.</p>
        </div>
      `,
    });

    if (emailError) {
      await supabaseAdmin
        .schema("private")
        .from("sessions")
        .delete()
        .eq("user_id", userId);

      await supabaseAdmin
        .schema("private")
        .from("users")
        .delete()
        .eq("id", userId);

      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: emailError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created. Check your email to verify your account.",
    });
  } catch (error) {
    console.error("signup error", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
