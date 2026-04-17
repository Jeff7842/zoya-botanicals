import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ACCOUNT_AVATAR_BUCKET, getStoredAccountAvatarObjectPath } from "@/lib/account/avatar";
import { revokeAllUserSessions } from "@/lib/auth/session-store";
import { applyNoStoreHeaders, clearAuthCookies } from "@/lib/auth/session-response";
import { supabaseAdmin } from "@/lib/supabase/supabase";

type DeleteAccountBody = {
  confirmation?: string;
};

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return applyNoStoreHeaders(NextResponse.json({ error: "Unauthorized." }, { status: 401 }));
    }

    const body = (await request.json().catch(() => ({}))) as DeleteAccountBody;
    if (body.confirmation?.trim() !== "DELETE") {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "Type DELETE in capital letters before deleting the account." },
          { status: 400 },
        ),
      );
    }

    const { data: userRow, error: userError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .select("img_url")
      .eq("id", session.user.id)
      .maybeSingle();

    if (userError) {
      return applyNoStoreHeaders(NextResponse.json({ error: userError.message }, { status: 500 }));
    }

    const avatarObjectPath = getStoredAccountAvatarObjectPath(userRow?.img_url ?? null);

    await revokeAllUserSessions(session.user.id);

    if (avatarObjectPath) {
      const { error: removeAvatarError } = await supabaseAdmin.storage
        .from(ACCOUNT_AVATAR_BUCKET)
        .remove([avatarObjectPath]);

      if (removeAvatarError) {
        console.error("delete account avatar cleanup error", removeAvatarError);
      }
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(session.user.id);

    if (deleteUserError) {
      return applyNoStoreHeaders(NextResponse.json({ error: deleteUserError.message }, { status: 500 }));
    }

    const response = NextResponse.json({
      success: true,
      message: "Your account has been permanently deleted.",
    });
    clearAuthCookies(response);
    return applyNoStoreHeaders(response);
  } catch (error) {
    console.error("delete account error", error);
    return applyNoStoreHeaders(NextResponse.json({ error: "Internal server error." }, { status: 500 }));
  }
}
