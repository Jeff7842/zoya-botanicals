"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { getProviders, signIn } from "next-auth/react";
import "@/components/css/main.css";
import "@/components/css/signup.css";
import { useTheme } from "next-themes";
import { useToast } from "@/components/toast/toast-provider";
import { useActiveAuthState } from "@/lib/auth/client-auth";

const OTP_LENGTH = 6;
const MAX_RESENDS = 5;
const FIRST_WAIT = 15;

export default function ZoyaLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { status } = useActiveAuthState();

  const [showPassword, setShowPassword] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const alreadyLoggedInTimeoutRef = useRef<number | null>(null);
  const alreadyLoggedInHandledRef = useRef(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [providersResolved, setProvidersResolved] = useState(false);
  

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpInvalidState, setOtpInvalidState] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const [resendCount, setResendCount] = useState(0);
  const [resendTimer, setResendTimer] = useState(FIRST_WAIT);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || alreadyLoggedInHandledRef.current) {
      return;
    }

    alreadyLoggedInHandledRef.current = true;

    showToast({
      title: "Already logged in",
      message: "Redirecting you to your homepage.",
      variant: "info",
    });

    alreadyLoggedInTimeoutRef.current = window.setTimeout(() => {
      router.replace("/");
    }, 900);
  }, [router, showToast, status]);

  useEffect(() => {
    return () => {
      if (alreadyLoggedInTimeoutRef.current !== null) {
        window.clearTimeout(alreadyLoggedInTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getProviders().then((providers) => {
      if (cancelled) return;

      setAvailableProviders(Object.keys(providers ?? {}));
      setProvidersResolved(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (!error) return;

    const authErrors: Record<
      string,
      {
        title: string;
        message: string;
        variant: "error" | "warning" | "info";
      }
    > = {
      ActiveSession: {
        title: "Already signed in",
        message: "This account already has an active session on another device.",
        variant: "warning",
      },
      OAuthEmail: {
        title: "Email required",
        message: "Incorrect email address or password.",
        variant: "error",
      },
      OAuthSignin: {
        title: "OAuth sign-in failed",
        message: "We could not start the provider sign-in flow. Please try again.",
        variant: "error",
      },
      OAuthCallback: {
        title: "OAuth callback failed",
        message: "The provider returned an invalid response. Please try again.",
        variant: "error",
      },
      AccessDenied: {
        title: "Access denied",
        message: "The request was canceled or denied by the provider.",
        variant: "warning",
      },
      Configuration: {
        title: "OAuth not configured",
        message: "This provider is missing its credentials.",
        variant: "warning",
      },
    };

    const authError = authErrors[error];

    if (authError) {
      showToast(authError);
    }
  }, [showToast]);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("zoya-theme") as "light" | "dark" | null;
    const preferred = saved ?? "light";
    root.classList.remove("light", "dark");
    root.classList.add(preferred);
    setTheme(preferred);
  }, [setTheme]);

  useEffect(() => {
    if (!otpModalOpen || resendTimer <= 0) return;

    const timer = window.setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpModalOpen, resendTimer]);

  useEffect(() => {
    if (!otpModalOpen) return;
    const firstEmptyIndex = otpDigits.findIndex((digit) => !digit);
    const targetIndex = firstEmptyIndex === -1 ? OTP_LENGTH - 1 : firstEmptyIndex;
    otpRefs.current[targetIndex]?.focus();
  }, [otpModalOpen, otpDigits]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem("zoya-theme", next);
    setTheme(next);
  };

  const logoSrc =
    resolvedTheme === "dark"
      ? "/images/zoya/zoya-symbol-yellow-2.webp"
      : "/images/zoya/zoya-symbol-dark-2.webp";

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);

  const maskedDestination = useMemo(() => {
    if (form.email?.trim()) {
      const email = form.email.trim();
      const [name, domain] = email.split("@");
      if (!domain) return email;
      const safeName =
        name.length <= 2 ? `${name[0] ?? ""}*` : `${name.slice(0, 2)}${"*".repeat(Math.max(1, name.length - 2))}`;
      return `${safeName}@${domain}`;
    }
    return "your phone number or email";
  }, [form.email]);

  const formatTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getNextResendDelay = (currentResendCount: number) => {
    if (currentResendCount === 0) return 30;
    if (currentResendCount === 1) return 60;
    return 60 + (currentResendCount - 1) * 30;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetOtpState = () => {
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setOtpInvalidState(false);
  };

  const handleOAuthSignIn = async (provider: "google" | "facebook") => {
    const label = provider === "google" ? "Google" : "Facebook";

    if (providersResolved && !availableProviders.includes(provider)) {
      showToast({
        title: `${label} unavailable`,
        message: `${label} OAuth is not configured yet. Add its auth credentials to enable this login.`,
        variant: "warning",
      });
      return;
    }

    await signIn(provider, {
      redirectTo: "/",
    });
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setIsSubmittingLogin(true);

  try {
    const res = await fetch("/api/auth/login/start-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast({
        title: "Sign in failed",
        message: data.error ?? "We could not start your secure sign-in flow.",
        variant: "error",
      });
      return;
    }

    resetOtpState();
    setResendCount(0);
    setResendTimer(FIRST_WAIT);
    setOtpModalOpen(true);

    showToast({
      title: "Security code sent",
      message: `A 6-digit OTP has been sent to ${maskedDestination}.`,
      variant: "info",
    });
  } catch {
    showToast({
      title: "Sign in failed",
      message: "We could not start your secure sign-in flow. Try again.",
      variant: "error",
    });
  } finally {
    setIsSubmittingLogin(false);
  }
};

  const handleOtpChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "").slice(-1);

    setOtpInvalidState(false);
    setOtpError("");

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (otpDigits[index]) {
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        return;
      }

      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, index) => {
      nextDigits[index] = char;
    });

    setOtpDigits(nextDigits);
    setOtpInvalidState(false);
    setOtpError("");

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleResendOtp = async () => {
  if (resendTimer > 0 || isResendingOtp) return;

  if (resendCount >= MAX_RESENDS) {
    setOtpModalOpen(false);
    resetOtpState();

    showToast({
      title: "Too many OTP requests",
      message: "You have reached the resend limit. Please sign in again.",
      variant: "warning",
    });

    return;
  }

  setIsResendingOtp(true);

  try {
    const res = await fetch("/api/auth/login/start-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast({
        title: "Resend failed",
        message: data.error ?? "We could not resend the OTP right now.",
        variant: "error",
      });
      return;
    }

    const nextDelay = getNextResendDelay(resendCount);
    setResendCount((prev) => prev + 1);
    setResendTimer(nextDelay);
    resetOtpState();

    showToast({
      title: "OTP resent",
      message: `A new verification code has been sent to ${maskedDestination}.`,
      variant: "success",
    });
  } catch {
    showToast({
      title: "Resend failed",
      message: "We could not resend the OTP right now. Try again in a moment.",
      variant: "error",
    });
  }finally {
    setIsResendingOtp(false);
  }
};

  const handleVerifyOtp = async () => {
  if (otpValue.length !== OTP_LENGTH) {
    setOtpInvalidState(true);
    setOtpError("Enter the full 6-digit code.");
    return;
  }

  setIsVerifyingOtp(true);
  setOtpInvalidState(false);
  setOtpError("");

  try {
    const result = await signIn("credentials", {
        email: form.email,
        otp: otpValue,
        rememberMe: String(form.rememberMe),
        redirect: false,
        redirectTo: "/",
    });

    if (!result?.ok) {
      throw new Error(result?.error ?? "Invalid OTP");
    }

    setOtpModalOpen(false);
    resetOtpState();

    showToast({
      title: "Login successful",
      message: "Your identity has been verified. Redirecting to your home page.",
      variant: "success",
    });

    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 900);
  } catch {
    setOtpInvalidState(true);
    setOtpError("Invalid code. Try again.");
    setOtpDigits(Array(OTP_LENGTH).fill(""));

    showToast({
      title: "Verification failed",
      message: "The OTP is incorrect or expired. Enter the latest code and try again.",
      variant: "error",
    });

    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 50);
  } finally {
    setIsVerifyingOtp(false);
  }
};

  return (
    <>
      <main className="min-h-screen font-body bg-[#f9f9fc] text-[#1a1c1e] transition-colors duration-300 dark:bg-[#140a2f] dark:text-white">
        <div className="flex min-h-screen flex-col md:flex-row">
          <section className="relative hidden overflow-hidden md:flex md:min-h-screen md:w-1/2 botanical-left-panel bg-[linear-gradient(135deg, #34058d 0%, #4b2ba3 100%)]">
            <div className="absolute z-0 inset-0 opacity-100 bg-[linear-gradient(135deg,rgba(52,5,141,0.96)_0%,rgba(75,43,163,0.82)_60%,rgba(42,10,115,0.98)_100%)]" />

            <div className="absolute inset-0 z-0 bg-[url(/images/background/login.png)] opacity-50 mix-blend-overlay">
              <Image
                src="/images/background/login.png"
                alt="Botanical background"
                fill
                sizes="100vh"
                priority
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute opacity-100 inset-0 bg-[#1d0a4f]/50" />

            <div className="absolute inset-0 opacity-20">
              <div className="absolute -left-32 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_70%)] blur-2xl" />
              <div className="absolute -bottom-20 left-16 h-[42rem] w-[42rem] rounded-full border border-white/5 bg-[conic-gradient(from_140deg_at_50%_50%,rgba(255,255,255,0.05),rgba(255,255,255,0.01),rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(255,255,255,0.05))] blur-[2px]" />
              <div className="absolute -right-36 top-0 h-[44rem] w-[44rem] rounded-full border border-white/5 bg-[conic-gradient(from_40deg_at_50%_50%,rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(255,255,255,0.04),rgba(255,255,255,0.01),rgba(255,255,255,0.08))] blur-[2px]" />
              <div className="absolute bottom-[-12rem] right-[-6rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(255,236,92,0.14)_0%,rgba(255,236,92,0)_72%)] blur-3xl" />
            </div>

            <div className="relative z-10 flex w-full flex-col justify-between px-25 py-10 lg:px-29 lg:py-12">
              <div className="mt-20 max-w-[28rem] pb-10">
                <div className="mb-20 text-[2.4rem] font-extrabold tracking-[-0.15rem] text-white lg:text-[2.75rem]">
                  ZOYA Botanicals
                </div>

                <h1 className="font-headline text-[4.6rem] font-semibold leading-[0.98] tracking-[-0.04em] text-white xl:text-[5.4rem]">
                  Curated
                  <br />
                  <span className="text-[#ffe24c]">Wellness.</span>
                </h1>

                <p className="mt-8 max-w-[25rem] text-[1.15rem] font-medium leading-8 text-[#d7cbff]">
                  Reconnect with nature through our science-backed botanical formulations.
                </p>

                <div className="mt-14 flex items-center gap-5">
                  <div className="flex -space-x-2.5">
                    {[
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCITZTcoeyp-ahejKOG4sHV2zbjfyPkcUmRmu2gOa1_sOtNnu0WekG5t8UX3Qs5XGlUzUkwLsa34Z2UxLreo0SdyysV-NL6OpaMtGhj-w4e8A6yvsN3HPzWd5wE5Ee_dPEQTAN8lfZmkdywHcqAxdBVikmwv7sJDuuFls_EQwFuAxamM2z94hiwpW9HGL-C9DHkvEXh6vuNuHVUYycBjFwBqcgnuo9jirxBs4oGatm3Qb73lipk8VO00aqlIgTwspCEq2XrxPyVHis",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVL2vXDhr7_whSFMeZTFERj_dWK9x1B3PnvWIOobX1lNScYjFsHXTHNEXqWA6U3f54We4aj_vHqAQz8R5numhxMYg993viA23KVh4hzWrmNNXRx5lo12DHT-4i6Ws_2pYyPJnOK1MRoIMS5nC_Ejg0nV8RAWkYofToEw98kWmLd7i5-a4OGIUCX17lPcEmDFEDOtv8eaIuzqhmPmZkhxKYe7g_23KMxmSkrq09i9hIuxyPDtoTzpO2pPLcmNQb4rJOajJNOk5Dp7M",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpcVhCwTi8g5iVsFZlbhrVG2crwMgYPXbUUMi8BCz0eFo4s5Hat7DtSahRwk3uhbEC0u7Nrq747iKYTh4wYY3coyVQEvQ3jcKJQ_KILaK8aODU7WzgHje6yhVyWgARFql4SZEu1L3XpaUZXP-pgSFMyrduHxVqvHROlGfsmOXxm0invJsa9S4ET1bazPxRVQS4rwczZ3-xkEOgfCdZjR0dlAgVwUZWT_QkC8LahXjoFIXEMrOndfDHdb-69X-Tkd_KdRQcncPsBOk",
                    ].map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        alt="Curator"
                        className="h-11 w-11 rounded-xl border-2 border-[#4b2ba3] object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[0.95rem] font-extrabold uppercase tracking-[0.14em] text-[#ffe24c]">
                    Join 20k+ Curators
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.34em] text-white/65">
                <Icon icon="mdi:leaf" className="text-sm text-white/65" />
                <span>100% Organic Origin</span>
              </div>
            </div>
          </section>

          <section className="flex min-h-screen w-full items-center justify-center bg-[#f4f4f7] px-6 py-4 dark:bg-[#120c24] md:w-1/2 md:px-10 md:py-12">
            <div className="w-full max-w-[34rem] rounded-[2rem] bg-transparent pt-[4vh] md:pt-[9vh]">
              <div className="mx-auto w-full max-w-[30rem]">
                <div className="mb-8 flex justify-center md:mb-10">
                  <div className="flex h-25 w-25 items-center justify-center overflow-hidden rounded-xl bg-transparent shadow-[0_18px_50px_rgba(52,5,141,0.01)]">
                    <Image
                      src={logoSrc}
                      alt="ZOYA Botanicals"
                      width={42}
                      height={42}
                      className="h-20 w-20 object-contain"
                      priority
                    />
                  </div>
                </div>

                <div className="mb-10 text-center">
                  <h2 className="font-[Manrope] text-[2.85rem] font-extrabold tracking-[-0.045em] text-[#101114] dark:text-white">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-[1.12rem] font-medium text-[#494553] dark:text-[#c9c4d7]">
                    Access your curated botanical dashboard.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                  <InputField
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="curator@zoya.com"
                    icon="solar:user-linear"
                    value={form.email}
                    onChange={handleChange}
                  />

                  <PasswordField
                    id="password"
                    label="Password"
                    placeholder="••••••••"
                    showPassword={showPassword}
                    togglePassword={() => setShowPassword((prev) => !prev)}
                    value={form.password}
                    onChange={handleChange}
                  />

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="checkbox-wrapper-46">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        className="inp-cbx"
                        checked={form.rememberMe}
                        onChange={handleChange}
                      />

                      <label htmlFor="rememberMe" className="cbx">
                        <span className="cbx-box">
                          <svg width="12px" height="10px" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1" />
                          </svg>
                        </span>

                        <span className="cbx-label">Remember Me</span>
                      </label>
                    </div>

                    <Link
                      href="/reset-password"
                      className="text-[0.98rem] font-bold text-[#34058d] transition-colors duration-200 hover:text-[#4b2ba3] dark:text-[#cdbdff] active:text-[#633ccd] dark:active:text-[#a997de] active:underline hover:underline dark:hover:text-white"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmittingLogin}
                      className="w-full rounded-xl bg-[#34058d] px-6 py-4 text-[1.15rem] font-extrabold tracking-[-0.01em] text-white shadow-[0_20px_40px_rgba(52,5,141,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4b2ba3] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmittingLogin ? (<span className="inline-flex items-center gap-3">
    <div className="size-4 animate-spin rounded-full border-2 border-white/90 border-t-transparent" />
    <span>Signing In...</span>
  </span>) : "Sign In"}
                    </button>
                  </div>
                </form>

                <div className="relative mt-15 mb-10 md:my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#cac4d5]/45 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#f4f4f7] px-5 text-[0.93rem] font-extrabold uppercase tracking-[0.18em] text-[#494553] dark:bg-[#120c24] dark:text-[#b9b3c8]">
                      Or Continue With
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-0 md:mt-0 md:gap-4">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={providersResolved && !availableProviders.includes("google")}
                    className="flex items-center justify-center gap-3 rounded-xl border border-[#cac4d5]/70 bg-white px-4 py-4 text-[1.05rem] font-semibold text-[#1a1c1e] transition-colors duration-200 hover:bg-[#f3f3f6] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#1b1431] dark:text-white dark:hover:bg-[#251b43]"
                  >
                    <Icon icon="logos:google-icon" className="text-xl" />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("facebook")}
                    disabled={providersResolved && !availableProviders.includes("facebook")}
                    className="flex items-center justify-center gap-3 rounded-xl border border-[#cac4d5]/70 bg-white px-4 py-4 text-[1.05rem] font-semibold text-[#1a1c1e] transition-colors duration-200 hover:bg-[#f3f3f6] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#1b1431] dark:text-white dark:hover:bg-[#251b43]"
                  >
                    <Icon icon="logos:facebook" className="text-xl" />
                    <span>Facebook</span>
                  </button>
                </div>

                <p className="mt-12 text-center text-[1rem] font-medium text-[#494553] dark:text-[#c9c4d7]">
                  New to the sanctuary?
                  <Link
                    href="/auth/signup"
                    className="ml-2 font-extrabold text-[#34058d] transition-colors duration-200 hover:text-[#4b2ba3] dark:text-[#cdbdff] dark:hover:text-white"
                  >
                    Sign Up
                  </Link>
                </p>

                <p className="mx-auto mt-7 max-w-[29rem] text-center text-[0.94rem] leading-7 text-[#6c6677] dark:text-[#b8b2c6]">
                  By signing in or creating an account, you agree with our Terms &amp; Conditions and Privacy Statement.
                </p>

                <div className="mt-14 border-t border-[#cac4d5]/20 pt-8">
                  <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
                    <Link
                      href="#"
                      className="text-[0.76rem] font-extrabold uppercase tracking-[0.22em] text-[#8a8594] transition-colors duration-200 hover:text-[#34058d] dark:text-[#8f88a3] dark:hover:text-white"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="#"
                      className="text-[0.76rem] font-extrabold uppercase tracking-[0.22em] text-[#8a8594] transition-colors duration-200 hover:text-[#34058d] dark:text-[#8f88a3] dark:hover:text-white"
                    >
                      Terms of Service
                    </Link>
                    <Link
                      href="#"
                      className="text-[0.76rem] font-extrabold uppercase tracking-[0.22em] text-[#8a8594] transition-colors duration-200 hover:text-[#34058d] dark:text-[#8f88a3] dark:hover:text-white"
                    >
                      Help Center
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {otpModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0c0719]/60 px-4 backdrop-blur-[6px]">
          <div className="relative w-full max-w-[34rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface-card)] p-6 shadow-[0_35px_90px_rgba(8,6,18,0.35)] md:p-8">
            <button
              type="button"
              onClick={() => {
                setOtpModalOpen(false);
                resetOtpState();
              }}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--text-muted)] transition-all duration-300 hover:bg-[var(--surface-soft)] hover:text-[var(--brand-primary)]"
              aria-label="Close OTP modal"
            >
              <Icon icon="ic:round-close" width="22" height="22" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[var(--brand-accent)] text-[#5b4b00] shadow-[0_18px_40px_rgba(252,223,70,0.24)]">
              <Icon icon="solar:shield-check-bold" width="30" height="30" />
            </div>

            <div className="mt-6 text-center">
              <h3 className="text-[2rem] font-extrabold tracking-[-0.04em] text-[var(--brand-primary)]">
                Secure Verification
              </h3>
              <p className="mx-auto mt-3 max-w-[26rem] text-[0.98rem] leading-7 text-[var(--text-muted)]">
                We have sent a 6-digit OTP to <span className="font-bold text-[var(--text-main)]">{maskedDestination}</span>.
              </p>
              <p className="mt-1 text-[0.95rem] text-[var(--text-muted)]">
                The code will expire after <span className="font-bold text-[#d23b3b]">5 minutes</span>.
              </p>
            </div>

            <div className={`mt-8 ${otpInvalidState ? "otp-shake" : ""}`}>
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                  title='otp'
                    key={index}
                    ref={(node) => {
                      otpRefs.current[index] = node;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
                    className={`h-14 w-12 rounded-[1rem] border text-center text-[1.35rem] font-extrabold outline-none transition-all duration-300 sm:h-16 sm:w-14 ${
                      otpInvalidState
                        ? "border-red-500 bg-red-50 text-red-700 shadow-[0_12px_30px_rgba(239,68,68,0.14)] dark:bg-red-500/10 dark:text-red-300"
                        : "border-[var(--ghost-border)] bg-[#f4f4f7] text-[var(--brand-primary)] focus:border-[#34058d] focus:bg-white focus:shadow-[0_16px_35px_rgba(52,5,141,0.10)] dark:bg-[#241b3d] dark:text-[#f3eefe] dark:focus:border-[#ffe24c] dark:focus:bg-[#1d1533]"
                    }`}
                  />
                ))}
              </div>

              {otpError ? (
                <p className="mt-3 text-center text-[0.92rem] font-bold text-red-600 dark:text-red-300">
                  {otpError} <span className="ml-1">Try again.</span>
                </p>
              ) : null}
            </div>

            <div className="mt-7 flex items-center justify-center gap-3 rounded-[1.25rem] bg-[var(--surface-soft)] px-4 py-3 text-center">
              <Icon icon="solar:clock-circle-bold" width="20" height="20" className="text-[var(--brand-primary)]" />
              <span className="text-[0.95rem] font-bold text-[var(--text-main)]">
                {resendTimer > 0 ? `Resend available in ${formatTimer(resendTimer)}` : "You can request a new OTP now."}
              </span>
            </div>

            <div className="mt-4 text-center">
              {resendTimer > 0 ? null : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isResendingOtp}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-[0.95rem] font-extrabold transition-all duration-300 ${
      resendTimer > 0 || isResendingOtp
        ? "cursor-not-allowed text-[#9f9aa9] opacity-70 dark:text-[#7f7891]"
        : "bg-transparent text-[#34058d] hover:text-[#4b2ba3] hover:underline dark:text-[#ffe24c] dark:hover:text-white"
    }`}
                >
                  {isResendingOtp ?  (<span className="inline-flex items-center gap-3">
    <div className="size-4 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
    <span>Resending OTP...</span>
  </span>) : "Resend OTP"}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              className="mt-6 w-full rounded-xl bg-[#34058d] px-6 py-4 text-[1.05rem] font-extrabold tracking-[-0.01em] text-white shadow-[0_20px_40px_rgba(52,5,141,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4b2ba3] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isVerifyingOtp ? (<span className="inline-flex items-center gap-3">
    <div className="size-4 animate-spin rounded-full border-2 border-white/90 border-t-transparent" />
    <span>Verifying OTP...</span>
  </span>) : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpModalOpen(false);
                resetOtpState();
              }}
              className="mt-3 w-full rounded-xl border border-[var(--ghost-border)] bg-transparent px-6 py-4 text-[1rem] font-bold text-[var(--text-main)] transition-all duration-300 hover:bg-[var(--surface-soft)]"
            >
              Back to Sign In
            </button>

            <p className="mt-5 text-center text-[0.82rem] leading-6 text-[var(--text-muted)]">
              Resend attempts: <span className="font-extrabold text-[var(--text-main)]">{resendCount}</span> / {MAX_RESENDS}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

type InputFieldProps = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ id, label, type, placeholder, icon, value, onChange }: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-3 ml-1 block text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-[#494553] dark:text-[#bcb6ca]"
      >
        {label}
      </label>

      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-[#9b97a5] transition-colors duration-200 group-focus-within:text-[#34058d] dark:text-[#8d87a0] dark:group-focus-within:text-[#cdbdff]">
          <Icon icon={icon} className="text-[1.25rem]" />
        </span>

        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-16 w-full rounded-xl border-0 bg-[#e2e2e5] pl-14 pr-5 text-[1rem] font-medium text-[#34058d] placeholder:text-[#9b97a5] shadow-none outline-none ring-0 transition-all duration-200 focus:bg-white focus:shadow-[0_16px_30px_rgba(52,5,141,0.06)] focus:outline-none focus:ring-0 dark:bg-[#251d3d] dark:text-[#e7deff] dark:placeholder:text-[#8f88a3] dark:focus:bg-[#1d1533]"
        />
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  showPassword: boolean;
  togglePassword: () => void;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function PasswordField({
  id,
  label,
  placeholder,
  showPassword,
  togglePassword,
  value,
  onChange,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-3 ml-1 block text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-[#494553] dark:text-[#bcb6ca]"
      >
        {label}
      </label>

      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-[#9b97a5] transition-colors duration-200 group-focus-within:text-[#34058d] dark:text-[#8d87a0] dark:group-focus-within:text-[#cdbdff]">
          <Icon icon="solar:lock-password-linear" className="text-[1.25rem]" />
        </span>

        <input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-16 w-full rounded-xl border-0 bg-[#e2e2e5] pl-14 pr-16 text-[1rem] font-medium text-[#34058d] placeholder:text-[#9b97a5] shadow-none outline-none ring-0 transition-all duration-200 focus:bg-white focus:shadow-[0_16px_30px_rgba(52,5,141,0.06)] focus:outline-none focus:ring-0 dark:bg-[#251d3d] dark:text-[#e7deff] dark:placeholder:text-[#8f88a3] dark:focus:bg-[#1d1533]"
        />

        <button
          type="button"
          onClick={togglePassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-4 flex items-center text-[#9b97a5] transition-colors duration-200 hover:text-[#34058d] dark:text-[#8d87a0] dark:hover:text-[#cdbdff]"
        >
          <Icon
            icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"}
            className="text-[1.35rem]"
          />
        </button>
      </div>
    </div>
  );
}
