import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/supabase";

type PasswordBody = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  acceptedPolicies?: boolean;
};

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function passwordHasRequiredStrength(value: string) {
  return value.length >= 12 && /[^A-Za-z0-9]/.test(value);
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as PasswordBody;
    const currentPassword = cleanValue(body.currentPassword);
    const newPassword = cleanValue(body.newPassword);
    const confirmPassword = cleanValue(body.confirmPassword);
    const acceptedPolicies = body.acceptedPolicies === true;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Fill in every password field." }, { status: 400 });
    }

    if (!acceptedPolicies) {
      return NextResponse.json({ error: "Accept the terms and privacy policy to continue." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "The new passwords do not match." }, { status: 400 });
    }

    if (!passwordHasRequiredStrength(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters long and include at least one symbol." },
        { status: 400 },
      );
    }

    const { data: accountRow, error: accountError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("email, password_reset_count")
      .eq("id", session.user.id)
      .maybeSingle<{ email: string; password_reset_count: number }>();

    if (accountError || !accountRow) {
      return NextResponse.json({ error: accountError?.message ?? "Account not found." }, { status: 404 });
    }

    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { error: signInError } = await supabasePublic.auth.signInWithPassword({
      email: accountRow.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: "Your current password is incorrect." }, { status: 401 });
    }

    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(session.user.id, {
      password: newPassword,
    });

    if (passwordError) {
      return NextResponse.json({ error: passwordError.message }, { status: 400 });
    }

    const { error: auditError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        password_reset_count: (accountRow.password_reset_count ?? 0) + 1,
        last_password_reset_at: new Date().toISOString(),
        next_password_reset_allowed_at: null,
      })
      .eq("id", session.user.id);

    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Your password was updated successfully.",
    });
  } catch (error) {
    console.error("account password update error", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
