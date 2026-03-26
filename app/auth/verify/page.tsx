import { Suspense } from "react";
import VerifiedUserView from "./VerifiedUserView";

type StatusKey =
  | "success"
  | "expired"
  | "invalid"
  | "timeout"
  | "error"
  | "failed";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const rawStatus = ((params?.status ?? "failed").toLowerCase()) as StatusKey;

  return (
    <Suspense fallback={null}>
      <VerifiedUserView status={rawStatus} />
    </Suspense>
  );
}