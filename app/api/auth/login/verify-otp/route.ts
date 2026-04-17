import { AuthError } from "next-auth";
import { NextResponse } from "next/server";
import { signIn } from "@/auth";

type VerifyOtpBody = {
  email: string;
  otp: string;
  rememberMe?: boolean;
};

function clearLegacySessionCookie(response: NextResponse) {
  response.cookies.set("zoya_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyOtpBody;
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();
    const rememberMe = Boolean(body.rememberMe);

    if (!email || !otp || otp.length !== 6) {
      return NextResponse.json(
        { error: "Valid OTP is required." },
        { status: 400 },
      );
    }

    const redirectUrl = await signIn("credentials", {
      email,
      otp,
      rememberMe: String(rememberMe),
      redirect: false,
      redirectTo: "/",
    });

    const authUrl = typeof redirectUrl === "string"
      ? new URL(redirectUrl, req.url)
      : null;

    if (authUrl?.searchParams.get("error")) {
      return NextResponse.json(
        { error: "Invalid or expired OTP." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        email,
      },
    });

    clearLegacySessionCookie(response);

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "Invalid or expired OTP." },
        { status: 400 },
      );
    }

    console.error("verify otp error", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
