"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/toast/toast-provider";

type AccountAvatarUploadProps = {
  displayName: string;
  username: string;
  imageUrl: string;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
];

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The selected file could not be processed as an image."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("We could not generate a profile image from that file."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

async function compressToWebp(file: File, username: string) {
  const image = await loadImage(file);
  const maxDimension = 1400;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser could not prepare the image for upload.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let blob = await canvasToBlob(canvas, 0.86);
  if (blob.size > 2.5 * 1024 * 1024) {
    blob = await canvasToBlob(canvas, 0.74);
  }

  return new File([blob], `${sanitizeFileName(username || "profile")}-avatar.webp`, {
    type: "image/webp",
  });
}

export default function AccountAvatarUpload({
  displayName,
  username,
  imageUrl,
}: AccountAvatarUploadProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [failedPreviewUrls, setFailedPreviewUrls] = useState<Set<string>>(() => new Set());
  const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null);
  const normalizedPreviewUrl = previewUrl.trim();
  const shouldShowPreview = Boolean(normalizedPreviewUrl) && !failedPreviewUrls.has(normalizedPreviewUrl);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
      }
    };
  }, [objectPreviewUrl]);

  async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    let nextPreviewUrl: string | null = null;
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      showToast({
        title: "Unsupported photo format",
        message: "Please choose a JPG, PNG, WEBP, GIF, AVIF, or BMP image.",
        variant: "error",
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      showToast({
        title: "Photo too large",
        message: "Choose an image smaller than 15MB before uploading it.",
        variant: "error",
      });
      return;
    }

    setPending(true);

    try {
      const processedFile = await compressToWebp(selectedFile, username);
      nextPreviewUrl = URL.createObjectURL(processedFile);

      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
      }

      setObjectPreviewUrl(nextPreviewUrl);
      setPreviewUrl(nextPreviewUrl);

      const formData = new FormData();
      formData.append("avatar", processedFile);

      const response = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        imageUrl?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "We could not upload your profile photo.");
      }

      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
      }

      setObjectPreviewUrl(payload.imageUrl ? null : nextPreviewUrl);
      setPreviewUrl(payload.imageUrl ?? nextPreviewUrl);

      if (payload.imageUrl && nextPreviewUrl) {
        URL.revokeObjectURL(nextPreviewUrl);
      }

      showToast({
        title: "Profile photo updated",
        message: payload.message ?? "Your new account photo is now live.",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      if (nextPreviewUrl) {
        URL.revokeObjectURL(nextPreviewUrl);
      }
      setObjectPreviewUrl(null);
      setPreviewUrl(imageUrl);
      showToast({
        title: "Upload failed",
        message: error instanceof Error ? error.message : "We could not update your profile photo.",
        variant: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="group relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#142430_0%,#233f55_100%)] p-1 shadow-[0_24px_60px_rgba(20,36,48,0.26)] transition-all duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
        aria-label="Change profile photo"
      >
        <span className="absolute inset-0 rounded-[2rem] border border-[#fcdf46]/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative flex h-full w-full overflow-hidden rounded-[1.7rem] bg-[#10212e]">
          {shouldShowPreview ? (
            <NextImage
              src={normalizedPreviewUrl}
              alt={`${displayName} profile photo`}
              fill
              sizes="144px"
              unoptimized
              className="object-cover"
              onError={() => {
                setFailedPreviewUrls((current) => {
                  if (current.has(normalizedPreviewUrl)) {
                    return current;
                  }

                  const next = new Set(current);
                  next.add(normalizedPreviewUrl);
                  return next;
                });
              }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#f2e9ff] text-[#34058d] dark:bg-[#1c152f] dark:text-[#fcdf46]">
              <Icon icon="solar:user-linear" width="56" height="56" />
            </span>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-[#120826]/42 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fcdf46] text-[#4b3700] shadow-[0_14px_28px_rgba(252,223,70,0.3)]">
              <Icon icon="solar:pen-new-square-bold" width="24" height="24" />
            </span>
          </span>
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        aria-label="Upload profile photo"
        onChange={handleFileSelection}
      />

      <p className="mt-4 text-sm font-semibold text-[#4e4860] dark:text-[#f3eeff]">{displayName}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#8f8aa0] dark:text-[#a496c6]">
        Hover to edit · Max 15MB
      </p>
      <p className="mt-2 max-w-xs text-xs leading-5 text-[#8f8aa0] dark:text-[#8d81ab]">
        Accepts JPG, PNG, WEBP, GIF, AVIF, and BMP. Images are compressed and stored as WEBP automatically.
      </p>
    </div>
  );
}
