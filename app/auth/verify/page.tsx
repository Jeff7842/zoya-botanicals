import Link from "next/link";

type VerifyPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function VerifiedUserPage({
  searchParams,
}: VerifyPageProps) {
  const { status } = await searchParams;

  const copy =
    status === "success"
      ? {
          title: "Account verified",
          text: "Your email has been verified successfully. You can now log in.",
        }
      : status === "expired"
      ? {
          title: "Verification link expired",
          text: "This verification link has expired. Request a new one.",
        }
      : status === "invalid"
      ? {
          title: "Invalid verification link",
          text: "This verification link is not valid.",
        }
      : {
          title: "Verification failed",
          text: "Something went wrong while verifying your account.",
        };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#f9f9fc]">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-[#34058d]">{copy.title}</h1>
        <p className="mt-4 text-[#494553]">{copy.text}</p>

        <Link
          href="/auth/login"
          className="mt-8 inline-flex rounded-xl bg-[#34058d] px-6 py-3 font-semibold text-white"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}