import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAccountAvatarUrl } from "@/lib/account/avatar";
import { applyNoStoreHeaders } from "@/lib/auth/session-response";
import { supabaseAdmin } from "@/lib/supabase/supabase";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return applyNoStoreHeaders(NextResponse.json({ authenticated: false }));
  }

  const { data: privateUser, error } = await supabaseAdmin
    .schema("private")
    .from("users")
    .select("id, username, first_name, email, img_url")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !privateUser) {
    return applyNoStoreHeaders(NextResponse.json({ authenticated: false }));
  }

  const response = NextResponse.json({
    authenticated: true,
    user: {
      id: privateUser.id,
      username: privateUser.username,
      first_name: privateUser.first_name,
      name: session.user.name,
      email: privateUser.email,
      imageUrl: await resolveAccountAvatarUrl(privateUser.img_url),
    },
  });

  return applyNoStoreHeaders(response);
}
