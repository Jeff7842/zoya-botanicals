import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  ACCOUNT_AVATAR_BUCKET,
  resolveAccountAvatarUrl,
  sanitizeAccountAvatarFolderSegment,
} from "@/lib/account/avatar";
import { getAccountProfile } from "@/lib/account/profile";
import { supabaseAdmin } from "@/lib/supabase/supabase";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/avif",
  "image/bmp",
]);

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const avatar = formData.get("avatar");

    if (!(avatar instanceof File)) {
      return NextResponse.json({ error: "Select an image to continue." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(avatar.type)) {
      return NextResponse.json(
        { error: "Use a valid image format such as JPG, PNG, WEBP, GIF, AVIF, or BMP." },
        { status: 400 },
      );
    }

    if (avatar.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Your profile photo must be 15MB or smaller." }, { status: 400 });
    }

    const profile = await getAccountProfile(session.user.id);
    const folderName = sanitizeAccountAvatarFolderSegment(profile.username || profile.displayName || "account");
    const objectPath = `${folderName}-${session.user.id}/avatar.webp`;
    const fileBuffer = await avatar.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(ACCOUNT_AVATAR_BUCKET)
      .upload(objectPath, fileBuffer, {
        upsert: true,
        contentType: "image/webp",
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const imageUrl = await resolveAccountAvatarUrl(objectPath);

    const { error: updateError } = await supabaseAdmin
      .schema("private")
      .from("users")
      .update({
        img_url: objectPath,
      })
      .eq("id", session.user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Your profile photo has been updated.",
    });
  } catch (error) {
    console.error("account avatar upload error", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
