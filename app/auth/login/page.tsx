"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import "@/components/css/main.css";
import "@/components/css/signup.css";
import { useTheme } from "next-themes";

export default function ZoyaLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn] = useState(false);
    const [username] = useState("Jeff");
    const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
  
  
    useEffect(() => {
      const root = document.documentElement;
      const saved = localStorage.getItem("zoya-theme") as "light" | "dark" | null;
      const preferred = saved ?? "light";
      root.classList.remove("light", "dark");
      root.classList.add(preferred);
      setTheme(preferred);
    }, []);
  
    const toggleTheme = () => {
      const next = theme === "light" ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(next);
      localStorage.setItem("zoya-theme", next);
      setTheme(next);
    };

    // Render a stable fallback during SSR + first client rende

  const logoSrc =
    resolvedTheme === "dark"
      ?"/images/zoya/zoya-symbol-yellow-2.webp"
      :"/images/zoya/zoya-symbol-dark-2.webp" ;
    

  return (
    <main className="min-h-screen font-body bg-[#f9f9fc] text-[#1a1c1e] transition-colors duration-300 dark:bg-[#140a2f] dark:text-white">
      <div className="flex min-h-screen flex-col md:flex-row" >
        <section className="relative hidden overflow-hidden md:flex md:min-h-screen md:w-1/2 botanical-left-panel bg-[linear-gradient(135deg, #34058d 0%, #4b2ba3 100%)]">
    {/* Purple gradient overlay */}
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
 {/* Extra soft darkening / blend layer for readability */}
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

              <form className="space-y-6">
                <InputField
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="curator@zoya.com"
                  icon="solar:user-linear"
                />

                <PasswordField
                  id="password"
                  label="Password"
                  placeholder="••••••••"
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword((prev) => !prev)}
                />

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="checkbox-wrapper-46">
  <input
    id="rememberMe"
    name="rememberMe"
    type="checkbox"
    className="inp-cbx"
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
                    className="w-full rounded-xl bg-[#34058d] px-6 py-4 text-[1.15rem] font-extrabold tracking-[-0.01em] text-white shadow-[0_20px_40px_rgba(52,5,141,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4b2ba3]"
                  >
                    Sign In to Account
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
                  className="flex items-center justify-center gap-3 rounded-xl border border-[#cac4d5]/70 bg-white px-4 py-4 text-[1.05rem] font-semibold text-[#1a1c1e] transition-colors duration-200 hover:bg-[#f3f3f6] dark:border-white/10 dark:bg-[#1b1431] dark:text-white dark:hover:bg-[#251b43]"
                >
                  <Icon icon="logos:google-icon" className="text-xl" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 rounded-xl border border-[#cac4d5]/70 bg-white px-4 py-4 text-[1.05rem] font-semibold text-[#1a1c1e] transition-colors duration-200 hover:bg-[#f3f3f6] dark:border-white/10 dark:bg-[#1b1431] dark:text-white dark:hover:bg-[#251b43]"
                >
                  <Icon icon="logos:apple" className="text-xl" />
                  <span>Apple</span>
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
                By signing in or creating an account, you agree with our Terms &amp;
                Conditions and Privacy Statement.
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
  );
}

type InputFieldProps = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: string;
};

function InputField({ id, label, type, placeholder, icon }: InputFieldProps) {
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
};

function PasswordField({
  id,
  label,
  placeholder,
  showPassword,
  togglePassword,
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
