"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import "@/components/css/main.css";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

type CountryOption = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

type PasswordRule = {
  label: string;
  passed: boolean;
};

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ?? "";

export default function ZoyaSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [cityLoading, setCityLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dialCode: "+254",
    phone: "",
    country: "Kenya",
    city: "",
    password: "",
    confirmPassword: "",
    isAdult: false,
    acceptsTerms: false,
    subscribeNews: true,
  });

  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("zoya-theme") as "light" | "dark" | null;
    const preferred = saved ?? "light";
    root.classList.remove("light", "dark");
    root.classList.add(preferred);
    setTheme(preferred);
  }, [setTheme]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem("zoya-theme", next);
    setTheme(next);
  };

  const logoSrc = mounted
    ? resolvedTheme === "light"
      ? "/images/zoya/zoya-symbol-dark-2.webp"
      : "/images/zoya/zoya-symbol-yellow-2.webp"
    : "/images/zoya/zoya-symbol-dark-2.webp";

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountryLoading(true);

        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag",
          { cache: "no-store" },
        );
        if (!res.ok) {
          throw new Error("Failed to load countries");
        }

        const data = await res.json();

        const mapped: CountryOption[] = data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => {
            const root = item?.idd?.root ?? "";
            const suffix = item?.idd?.suffixes?.[0] ?? "";
            const dialCode = `${root}${suffix}`.trim();

            return {
              name: item?.name?.common ?? "",
              code: item?.cca2 ?? "",
              dialCode: dialCode || "",
              flag: item?.flag ?? "🌍",
            };
          })
          .filter((item: CountryOption) => item.name && item.dialCode)
          .sort((a: CountryOption, b: CountryOption) =>
            a.name.localeCompare(b.name),
          );

        setCountries(mapped);

        const kenya = mapped.find((item) => item.name === "Kenya");
        if (kenya) {
          setForm((prev) => ({
            ...prev,
            country: "Kenya",
            dialCode: kenya.dialCode,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCountryLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!form.country) {
        setCities([]);
        return;
      }

      try {
        setCityLoading(true);
        setCities([]);

        const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: form.country }),
        });

        if (!res.ok) {
          throw new Error("Failed to load cities");
        }

        const data = await res.json();
        const nextCities = Array.isArray(data?.data) ? data.data : [];
        setCities(nextCities);

        setForm((prev) => ({
          ...prev,
          city: nextCities.includes(prev.city) ? prev.city : "",
        }));
      } catch (error) {
        console.error(error);
        setCities([]);
      } finally {
        setCityLoading(false);
      }
    };

    fetchCities();
  }, [form.country]);

  const passwordRules: PasswordRule[] = useMemo(
    () => [
      {
        label: "At least one number",
        passed: /\d/.test(form.password),
      },
      {
        label: "At least one special character",
        passed: /[^A-Za-z0-9]/.test(form.password),
      },
      {
        label: "At least one capital letter",
        passed: /[A-Z]/.test(form.password),
      },
      {
        label: "At least one lowercase letter",
        passed: /[a-z]/.test(form.password),
      },
      {
        label: "Minimum 8 characters",
        passed: form.password.length >= 8,
      },
    ],
    [form.password],
  );

  const passwordStarted = form.password.length > 0;
  const passwordValid = passwordRules.every((rule) => rule.passed);
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.country.trim() &&
    form.city.trim() &&
    passwordValid &&
    passwordsMatch &&
    form.isAdult &&
    form.acceptsTerms &&
    !!turnstileToken;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = countries.find(
      (item) => item.name === e.target.value,
    );

    setForm((prev) => ({
      ...prev,
      country: e.target.value,
      city: "",
      dialCode: selectedCountry?.dialCode || prev.dialCode,
    }));
  };

  const renderTurnstile = () => {
    if (
      !TURNSTILE_SITE_KEY ||
      !turnstileRef.current ||
      !window.turnstile ||
      turnstileWidgetId.current
    ) {
      return;
    }

    turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: resolvedTheme === "dark" ? "dark" : "light",
      callback: (token: string) => {
        setTurnstileToken(token);
      },
      "expired-callback": () => {
        setTurnstileToken("");
      },
      "error-callback": () => {
        setTurnstileToken("");
      },
    });
  };

  useEffect(() => {
    if (!mounted) return;

    if (turnstileWidgetId.current && window.turnstile?.remove) {
      window.turnstile.remove(turnstileWidgetId.current);
      turnstileWidgetId.current = null;
      setTurnstileToken("");
      if (turnstileRef.current) {
        turnstileRef.current.innerHTML = "";
      }
    }

    const timeout = setTimeout(() => {
      renderTurnstile();
    }, 0);

    return () => clearTimeout(timeout);
  }, [mounted, resolvedTheme]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    console.log("Signup payload", {
      ...form,
      phoneNumber: `${form.dialCode}${form.phone}`,
      turnstileToken,
    });
  };

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => renderTurnstile()}
      />

      <main className="min-h-screen font-body bg-[#f9f9fc] text-[#1a1c1e] transition-colors duration-300 dark:bg-[#140a2f] dark:text-white">
        <div className="flex min-h-screen flex-col md:flex-row ">

          <section className="relative flex min-h-screen w-[70%] md:flex-[1.3] items-center justify-center bg-[#f4f4f7] px-6 py-8 dark:bg-[#120c24] md:w-1/2 md:px-10 md:py-12">
            <button
              type="button"
              onClick={toggleTheme}
              className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#cac4d5]/65 bg-white text-[#34058d] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f3f3f6] dark:border-white/10 dark:bg-[#1b1431] dark:text-[#ffe24c] dark:hover:bg-[#251b43]"
              aria-label="Toggle theme"
            >
              <Icon
                icon={resolvedTheme === "dark" ? "solar:sun-2-linear" : "solar:moon-linear"}
                className="text-[1.35rem]"
              />
            </button>

            <div className="w-full max-w-[54rem] rounded-[2rem] bg-transparent py-[3vh]">
              <div className="mx-auto w-full max-w-[52rem]">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-transparent">
                    <Image
                      src={logoSrc}
                      alt="ZOYA Botanicals"
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain"
                      priority
                    />
                  </div>
                </div>

                <div className="mb-10 text-center">
                  <h2 className="font-[Manrope] text-[2.85rem] font-extrabold tracking-[-0.045em] text-[#101114] dark:text-white">
                    Create Account
                  </h2>
                  <p className="mt-2 text-[1.08rem] font-medium text-[#494553] dark:text-[#c9c4d7]">
                    Start your journey with botanical excellence.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      id="firstName"
                      label="First Name"
                      type="text"
                      placeholder="Evelyn"
                      icon="solar:user-linear"
                      value={form.firstName}
                      onChange={handleInputChange}
                    />
                    <InputField
                      id="lastName"
                      label="Last Name"
                      type="text"
                      placeholder="Thorne"
                      icon="solar:user-id-linear"
                      value={form.lastName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      id="email"
                      label="Email Address"
                      type="email"
                      placeholder="curator@zoya.com"
                      icon="solar:letter-linear"
                      value={form.email}
                      onChange={handleInputChange}
                    />

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-3 ml-1 block text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-[#494553] dark:text-[#bcb6ca]"
                      >
                        Phone Number
                      </label>

                      <div className="flex h-16 overflow-hidden rounded-2xl bg-[#e2e2e5] transition-all duration-200 focus-within:bg-white focus-within:shadow-[0_16px_30px_rgba(52,5,141,0.06)] dark:bg-[#251d3d] dark:focus-within:bg-[#1d1533]">
                        <select
                          name="dialCode"
                          value={form.dialCode}
                          onChange={handleInputChange}
                          className="min-w-[1rem] border-0 bg-transparent px-4 text-[0.98rem] font-semibold text-[#34058d] outline-none ring-0 dark:text-[#e7deff]"
                        >
                          {countryLoading ? (
                            <option>Loading...</option>
                          ) : (
                            countries.map((country) => (
                              <option key={`${country.code}-${country.dialCode}`} value={country.dialCode}>
                                {country.flag} {country.dialCode}
                              </option>
                            ))
                          )}
                        </select>

                        <div className="w-px bg-[#cac4d5]/70 dark:bg-white/10" />

                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          placeholder="712 345 678"
                          value={form.phone}
                          onChange={handleInputChange}
                          className="h-full w-full border-0 bg-transparent px-4 text-[1rem] font-medium text-[#34058d] placeholder:text-[#9b97a5] outline-none ring-0 dark:text-[#e7deff] dark:placeholder:text-[#8f88a3]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="country"
                        className="mb-3 ml-1 block text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-[#494553] dark:text-[#bcb6ca]"
                      >
                        Country
                      </label>

                      <div className="group relative">
                        <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-[#9b97a5] dark:text-[#8d87a0]">
                          <Icon icon="solar:global-linear" className="text-[1.25rem]" />
                        </span>

                        <select
                          id="country"
                          name="country"
                          value={form.country}
                          onChange={onCountryChange}
                          className="h-16 w-full rounded-2xl border-0 bg-[#e2e2e5] pl-14 pr-5 text-[1rem] font-medium text-[#34058d] outline-none ring-0 transition-all duration-200 focus:bg-white focus:shadow-[0_16px_30px_rgba(52,5,141,0.06)] dark:bg-[#251d3d] dark:text-[#e7deff] dark:focus:bg-[#1d1533]"
                        >
                          {countryLoading ? (
                            <option>Loading countries...</option>
                          ) : (
                            countries.map((country) => (
                              <option key={country.code} value={country.name}>
                                {country.flag} {country.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="mb-3 ml-1 block text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-[#494553] dark:text-[#bcb6ca]"
                      >
                        City
                      </label>

                      <div className="group relative">
                        <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-[#9b97a5] dark:text-[#8d87a0]">
                          <Icon icon="solar:map-point-linear" className="text-[1.25rem]" />
                        </span>

                        <select
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleInputChange}
                          disabled={cityLoading || cities.length === 0}
                          className="h-16 w-full rounded-2xl border-0 bg-[#e2e2e5] pl-14 pr-5 text-[1rem] font-medium text-[#34058d] outline-none ring-0 transition-all duration-200 focus:bg-white focus:shadow-[0_16px_30px_rgba(52,5,141,0.06)] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#251d3d] dark:text-[#e7deff] dark:focus:bg-[#1d1533]"
                        >
                          <option value="">
                            {cityLoading
                              ? "Loading cities..."
                              : cities.length
                                ? "Select city"
                                : "No cities found"}
                          </option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <PasswordField
                      id="password"
                      label="Enter Password"
                      placeholder="Create a strong password"
                      showPassword={showPassword}
                      togglePassword={() => setShowPassword((prev) => !prev)}
                      value={form.password}
                      onChange={handleInputChange}
                    />

                    <PasswordField
                      id="confirmPassword"
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      showPassword={showConfirmPassword}
                      togglePassword={() => setShowConfirmPassword((prev) => !prev)}
                      value={form.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="rounded-2xl border border-[#cac4d5]/0 bg-white/0 p-4 dark:border-white/0 dark:bg-[#1b1431]/0">
                    <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-[#6d6778] dark:text-[#b7b1c5]">
                      Password Checklist
                    </p>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {passwordRules.map((rule) => {
                        const idle = !passwordStarted;
                        const colorClass = idle
                          ? "text-[#9b97a5] dark:text-[#8f88a3]"
                          : rule.passed
                            ? "text-[#12a150]"
                            : "text-[#d92d20]";

                        const icon = idle
                          ? "solar:shield-check-linear"
                          : rule.passed
                            ? "solar:check-circle-bold"
                            : "solar:close-circle-bold";

                        return (
                          <div
                            key={rule.label}
                            className={`flex items-center gap-2 text-[0.93rem] font-medium ${colorClass}`}
                          >
                            <Icon icon={icon} className="text-[1rem]" />
                            <span>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {form.confirmPassword.length > 0 && (
                      <div
                        className={`mt-4 flex items-center gap-2 text-[0.93rem] font-medium ${
                          passwordsMatch ? "text-[#12a150]" : "text-[#d92d20]"
                        }`}
                      >
                        <Icon
                          icon={
                            passwordsMatch
                              ? "solar:check-circle-bold"
                              : "solar:close-circle-bold"
                          }
                          className="text-[1rem]"
                        />
                        <span>
                          {passwordsMatch
                            ? "Passwords match"
                            : "Passwords do not match"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 rounded-2xl border border-[#cac4d5]/55 bg-white/70 p-5 dark:border-white/10 dark:bg-[#1b1431]/80">
                    <CheckboxField
                      id="isAdult"
                      checked={form.isAdult}
                      onChange={handleInputChange}
                      label="I confirm that I am 18 years and above."
                    />

                    <CheckboxField
                      id="acceptsTerms"
                      checked={form.acceptsTerms}
                      onChange={handleInputChange}
                      label="I agree to the Terms of Service and Privacy Policy."
                    />

                    <CheckboxField
                      id="subscribeNews"
                      checked={form.subscribeNews}
                      onChange={handleInputChange}
                      label="Sign me up for the Botanical Gazette."
                      hint="Receive curated updates, seasonal drops, and wellness insights."
                    />
                  </div>

                  <div className="rounded-2xl border border-[#cac4d5]/55 bg-white/80 p-4 dark:border-white/10 dark:bg-[#1b1431]">
                    <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-[#6d6778] dark:text-[#b7b1c5]">
                      Security Verification
                    </p>

                    {TURNSTILE_SITE_KEY ? (
                      <div ref={turnstileRef} className="min-h-[65px]" />
                    ) : (
                      <div className="rounded-xl border border-dashed border-[#cac4d5] px-4 py-4 text-sm text-[#7b7588] dark:border-white/10 dark:text-[#a9a2ba]">
                        Add <span className="font-bold">NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY</span> to render Turnstile.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full max-w-[75%]  text-center flex items-center justify-center rounded-2xl bg-[#34058d] px-6 py-4 text-[1.08rem] font-extrabold tracking-[0.02em] text-white shadow-[0_20px_40px_rgba(52,5,141,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4b2ba3] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    Create Account
                  </button>
                </form>

                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#cac4d5]/45 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#f4f4f7] px-5 text-[0.93rem] font-extrabold uppercase tracking-[0.18em] text-[#494553] dark:bg-[#120c24] dark:text-[#b9b3c8]">
                      Or Continue With
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 rounded-2xl border border-[#cac4d5]/70 bg-white px-4 py-4 text-[1.05rem] font-semibold text-[#1a1c1e] transition-colors duration-200 hover:bg-[#f3f3f6] dark:border-white/10 dark:bg-[#1b1431] dark:text-white dark:hover:bg-[#251b43]"
                  >
                    <Icon icon="logos:google-icon" className="text-xl" />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 rounded-2xl border border-[#cac4d5]/70 bg-white px-4 py-4 text-[1.05rem] font-semibold text-[#1a1c1e] transition-colors duration-200 hover:bg-[#f3f3f6] dark:border-white/10 dark:bg-[#1b1431] dark:text-white dark:hover:bg-[#251b43]"
                  >
                    <Icon icon="logos:apple" className="text-xl" />
                    <span>Apple</span>
                  </button>
                </div>

                <p className="mt-12 text-center text-[1rem] font-medium text-[#494553] dark:text-[#c9c4d7]">
                  Already have an account?
                  <Link
                    href="/login"
                    className="ml-2 font-extrabold text-[#34058d] transition-colors duration-200 hover:text-[#4b2ba3] dark:text-[#cdbdff] dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                </p>

                <p className="mx-auto mt-7 max-w-[31rem] text-center text-[0.94rem] leading-7 text-[#6c6677] dark:text-[#b8b2c6]">
                  By creating an account, you confirm your eligibility, accept our
                  Terms &amp; Conditions, and acknowledge our Privacy Statement.
                </p>
              </div>
            </div>
          </section>

                    <section className="relative hidden overflow-hidden md:flex md:min-h-screen md:flex-[0.9] bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)]">
            <div className="absolute inset-0 z-0 opacity-100 bg-[linear-gradient(135deg,rgba(52,5,141,0.96)_0%,rgba(75,43,163,0.82)_60%,rgba(42,10,115,0.98)_100%)]" />

            <div className="absolute inset-0 z-0 bg-[url(/images/background/login.png)] opacity-50 mix-blend-overlay">
              <Image
                src="/images/background/login.png"
                alt="Botanical background"
                fill
                priority
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute inset-0 bg-[#1d0a4f]/50" />

            <div className="absolute inset-0 opacity-20">
              <div className="absolute -left-32 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_70%)] blur-2xl" />
              <div className="absolute -bottom-20 left-16 h-[42rem] w-[42rem] rounded-full border border-white/5 bg-[conic-gradient(from_140deg_at_50%_50%,rgba(255,255,255,0.05),rgba(255,255,255,0.01),rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(255,255,255,0.05))] blur-[2px]" />
              <div className="absolute -right-36 top-0 h-[44rem] w-[44rem] rounded-full border border-white/5 bg-[conic-gradient(from_40deg_at_50%_50%,rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(255,255,255,0.04),rgba(255,255,255,0.01),rgba(255,255,255,0.08))] blur-[2px]" />
              <div className="absolute bottom-[-12rem] right-[-6rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(255,236,92,0.14)_0%,rgba(255,236,92,0)_72%)] blur-3xl" />
            </div>

            <div className="relative z-10 flex w-full flex-col justify-between px-16 py-12 lg:px-24">
              <div className="mt-12 text-[2.4rem] font-extrabold tracking-[-0.15rem] text-white lg:text-[2.75rem]">
                ZOYA Botanicals
              </div>

              <div className="max-w-[31rem] pb-12">
                <h1 className="font-headline text-[4.25rem] font-semibold leading-[0.98] tracking-[-0.04em] text-white xl:text-[5rem]">
                  Begin your
                  <br />
                  <span className="text-[#ffe24c]">wellness ritual.</span>
                </h1>

                <p className="mt-8 max-w-[27rem] text-[1.12rem] font-medium leading-8 text-[#d7cbff]">
                  Build your curator account and unlock a more intentional botanical
                  experience across every touchpoint.
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
                        className="h-11 w-11 rounded-2xl border-2 border-[#4b2ba3] object-cover"
                      />
                    ))}
                  </div>

                  <span className="text-[0.95rem] font-extrabold uppercase tracking-[0.14em] text-[#ffe24c]">
                    Join 20k+ Curators
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[0.74rem] font-bold uppercase tracking-[0.32em] text-white/65">
                <Icon icon="mdi:leaf" className="text-base text-white/65" />
                <span>Curated Botanical Access</span>
              </div>
            </div>
          </section>

        </div>
      </main>
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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
};

function InputField({
  id,
  label,
  type,
  placeholder,
  icon,
  value,
  onChange,
}: InputFieldProps) {
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
          className="h-16 w-full rounded-2xl border-0 bg-[#e2e2e5] pl-14 pr-5 text-[1rem] font-medium text-[#34058d] placeholder:text-[#9b97a5] shadow-none outline-none ring-0 transition-all duration-200 focus:bg-white focus:shadow-[0_16px_30px_rgba(52,5,141,0.06)] focus:outline-none focus:ring-0 dark:bg-[#251d3d] dark:text-[#e7deff] dark:placeholder:text-[#8f88a3] dark:focus:bg-[#1d1533]"
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
          className="h-16 w-full rounded-2xl border-0 bg-[#e2e2e5] pl-14 pr-16 text-[1rem] font-medium text-[#34058d] placeholder:text-[#9b97a5] shadow-none outline-none ring-0 transition-all duration-200 focus:bg-white focus:shadow-[0_16px_30px_rgba(52,5,141,0.06)] focus:outline-none focus:ring-0 dark:bg-[#251d3d] dark:text-[#e7deff] dark:placeholder:text-[#8f88a3] dark:focus:bg-[#1d1533]"
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

type CheckboxFieldProps = {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  hint?: string;
};

function CheckboxField({
  id,
  checked,
  onChange,
  label,
  hint,
}: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 rounded-md border-0 bg-[#e2e2e5] text-[#34058d] shadow-none ring-0 focus:ring-0 dark:bg-[#2a2047]"
      />
      <span className="block">
        <span className="block text-[0.98rem] font-medium text-[#312d39] dark:text-[#d9d4e5]">
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-[0.86rem] text-[#6c6677] dark:text-[#aaa3bb]">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}