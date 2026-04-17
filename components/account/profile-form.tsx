"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import AccountTitleBadge from "@/components/account/title-badge";
import CustomSelect, { type CustomSelectOption } from "@/components/account/custom-select";
import { useToast } from "@/components/toast/toast-provider";
import { formatDateTime, type AccountProfile } from "@/lib/account/shared";

type ProfileFormProps = {
  profile: AccountProfile;
};

type CountryOption = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

const inputClassName =
  "h-14 w-full rounded-[1.15rem] border border-transparent bg-[#eceaf1] px-4 text-[0.98rem] text-[#322d40] outline-none transition-all duration-200 placeholder:text-[#aaa5b8] focus:border-[#cbbdf4] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#1d1630] dark:text-[#f2edff] dark:placeholder:text-[#8d81ab] dark:focus:border-[#4b2ba3] dark:focus:bg-[#241b3a]";

function splitPhoneNumber(phoneNumber: string, countries: CountryOption[]) {
  const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");
  const sortedDialCodes = [...countries]
    .filter((country) => country.dialCode)
    .sort((left, right) => right.dialCode.length - left.dialCode.length);

  const matchedCountry = sortedDialCodes.find((country) => normalizedPhone.startsWith(country.dialCode));

  if (!matchedCountry) {
    return {
      dialCode: "",
      localPhone: phoneNumber,
      countryName: "",
    };
  }

  return {
    dialCode: matchedCountry.dialCode,
    localPhone: normalizedPhone.slice(matchedCountry.dialCode.length),
    countryName: matchedCountry.name,
  };
}

export default function AccountProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [cityLoading, setCityLoading] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [dialCode, setDialCode] = useState("+254");
  const [phone, setPhone] = useState(profile.phone);
  const [country, setCountry] = useState(profile.country);
  const [city, setCity] = useState(profile.city);
  const [username, setUsername] = useState(profile.username);

  const policy = profile.usernamePolicy;
  const usernameLocked = !policy.canChangeNow || policy.changesRemaining === 0;

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setCountry(profile.country);
    setCity(profile.city);
    setUsername(profile.username);
  }, [profile.city, profile.country, profile.email, profile.firstName, profile.lastName, profile.username]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountryLoading(true);

        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load country options.");
        }

        const data = await response.json();
        const mapped = (Array.isArray(data) ? data : [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => {
            const root = item?.idd?.root ?? "";
            const suffix = item?.idd?.suffixes?.[0] ?? "";
            const nextDialCode = `${root}${suffix}`.trim();

            return {
              name: item?.name?.common ?? "",
              code: item?.cca2 ?? "",
              dialCode: nextDialCode,
              flag: item?.flag ?? "🌍",
            } satisfies CountryOption;
          })
          .filter((item: CountryOption) => item.name && item.dialCode)
          .sort((left: CountryOption, right: CountryOption) => left.name.localeCompare(right.name));

        setCountries(mapped);

        const parsedPhone = splitPhoneNumber(profile.phone, mapped);
        const matchingCountry =
          mapped.find((item) => item.name === profile.country) ??
          mapped.find((item) => item.name === parsedPhone.countryName) ??
          mapped.find((item) => item.name === "Kenya") ??
          mapped[0];

        setDialCode(parsedPhone.dialCode || matchingCountry?.dialCode || "+254");
        setPhone(parsedPhone.localPhone || (parsedPhone.dialCode ? "" : profile.phone));
        setCountry(profile.country || matchingCountry?.name || "");
      } catch (error) {
        console.error(error);
      } finally {
        setCountryLoading(false);
      }
    };

    void fetchCountries();
  }, [profile.country, profile.phone]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!country) {
        setCities([]);
        return;
      }

      try {
        setCityLoading(true);
        setCities([]);

        const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country }),
        });

        if (!response.ok) {
          throw new Error("Failed to load city options.");
        }

        const payload = await response.json();
        const nextCities = Array.isArray(payload?.data) ? payload.data : [];
        setCities(nextCities);
        setCity((current) => (nextCities.includes(current) ? current : ""));
      } catch (error) {
        console.error(error);
        setCities([]);
      } finally {
        setCityLoading(false);
      }
    };

    void fetchCities();
  }, [country]);

  const countryOptions = useMemo<CustomSelectOption[]>(
    () =>
      countries.map((item) => ({
        value: item.name,
        label: `${item.flag} ${item.name}`,
        searchText: `${item.name} ${item.code} ${item.dialCode}`,
      })),
    [countries],
  );

  const cityOptions = useMemo<CustomSelectOption[]>(
    () =>
      cities.map((item) => ({
        value: item,
        label: item,
        searchText: item,
      })),
    [cities],
  );

  const dialCodeOptions = useMemo<CustomSelectOption[]>(
    () =>
      countries.map((item) => ({
        value: item.dialCode,
        label: `${item.flag} ${item.dialCode}`,
        secondaryLabel: item.name,
        searchText: `${item.name} ${item.code} ${item.dialCode}`,
      })),
    [countries],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone.trim() ? `${dialCode}${phone.trim()}` : "",
          country,
          city,
          username,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        showToast({
          title: "Profile update failed",
          message: payload.error ?? "We could not save your account details.",
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Profile updated",
        message: payload.message ?? "Your account details are now up to date.",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch {
      showToast({
        title: "Network issue",
        message: "Your changes could not reach the server. Please try again.",
        variant: "error",
      });
    } finally {
      setPending(false);
    }
  }

  function handleDiscard() {
    const parsedPhone = splitPhoneNumber(profile.phone, countries);
    const fallbackCountry =
      countries.find((item) => item.name === profile.country) ?? countries.find((item) => item.name === "Kenya");

    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setDialCode(parsedPhone.dialCode || fallbackCountry?.dialCode || "+254");
    setPhone(parsedPhone.localPhone || (parsedPhone.dialCode ? "" : profile.phone));
    setCountry(profile.country || fallbackCountry?.name || "");
    setCity(profile.city);
    setUsername(profile.username);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <AccountTitleBadge icon="solar:user-id-linear" label="Profile Settings" />
            <h2 className="mt-5 font-headline text-[1.95rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">
              Personal Details
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f6a7d] dark:text-[#b6abcf]">
              Update the only account details surfaced from your secure Zoya profile: name, email, phone number,
              country, city, and username.
            </p>
          </div>
          <span className="rounded-full bg-[#f0eef5] px-4 py-1 text-[0.64rem] font-bold uppercase tracking-[0.24em] text-[#8f8aa0] dark:bg-[#24173e] dark:text-[#cdb7ff]">
            Section 01
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                First Name
              </span>
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className={inputClassName} />
            </label>

            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                Last Name
              </span>
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} className={inputClassName} />
            </label>

            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                Email Address
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                Phone Number
              </span>
              <div className="flex overflow-visible rounded-[1.15rem] bg-[#eceaf1] dark:bg-[#1d1630]">
                <div className="w-[9.6rem] shrink-0">
                  <CustomSelect
                    value={dialCode}
                    onChange={setDialCode}
                    options={dialCodeOptions}
                    disabled={countryLoading || dialCodeOptions.length === 0}
                    searchable
                    searchPlaceholder="Search code"
                    placeholder={countryLoading ? "Loading..." : "Code"}
                    buttonClassName="rounded-r-none border-r border-[#ddd7e8] bg-transparent shadow-none hover:bg-[#f5f2fa] dark:border-[#2e2445] dark:hover:bg-[#241b3a]"
                    panelClassName="min-w-[16rem]"
                    align="left"
                  />
                </div>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="712 345 678"
                  className="h-14 min-w-0 flex-1 rounded-r-[1.15rem] rounded-l-none border border-transparent bg-transparent px-4 text-[0.98rem] text-[#322d40] outline-none placeholder:text-[#aaa5b8] focus:border-[#cbbdf4] dark:text-[#f2edff] dark:placeholder:text-[#8d81ab]"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                Country
              </span>
              <CustomSelect
                value={country}
                onChange={(selectedCountry) => {
                  const matchedCountry = countries.find((item) => item.name === selectedCountry);
                  setCountry(selectedCountry);
                  setCity("");
                  if (matchedCountry?.dialCode) {
                    setDialCode(matchedCountry.dialCode);
                  }
                }}
                options={countryOptions}
                disabled={countryLoading || countryOptions.length === 0}
                searchable
                searchPlaceholder="Search country"
                placeholder={countryLoading ? "Loading countries..." : "Select country"}
                emptyText="No country matched your search."
                selectedLabelClassName="text-[1.05rem]"
                optionLabelClassName="text-[1.03rem]"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                City
              </span>
              <CustomSelect
                value={city}
                onChange={setCity}
                options={cityOptions}
                disabled={cityLoading || cityOptions.length === 0}
                searchable
                searchPlaceholder="Search city"
                placeholder={
                  country
                    ? cityLoading
                      ? "Loading cities..."
                      : cityOptions.length > 0
                        ? "Select city"
                        : "No cities found"
                    : "Select country first"
                }
                emptyText="No city matched your search."
              />
            </label>

            <div className="md:col-span-2">
              <label className="flex flex-col gap-2">
                <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                  Username
                </span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={usernameLocked}
                  placeholder="Choose a unique handle"
                  className={inputClassName}
                />
              </label>

              <div className="mt-3 rounded-[1.5rem] border border-[#ece6f7] bg-[#faf8ff] p-4 text-sm text-[#6a6578] dark:border-[#2c2144] dark:bg-[#171126] dark:text-[#b6abcf]">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#efe8ff] text-[#34058d] dark:bg-[#24173e] dark:text-[#d7c4ff]">
                    <Icon icon="solar:user-block-linear" width="18" height="18" />
                  </span>
                  <div>
                    <p className="font-semibold text-[#34058d] dark:text-[#e6ddff]">
                      {policy.migrationInstalled
                        ? policy.maxChanges > 0
                        ? `Username changes used: ${policy.changesUsed}/${policy.maxChanges}`
                        : `Remaining username changes: ${policy.changesRemaining}`
                        : "Username policy unavailable"}
                    </p>
                    <p className="mt-2 leading-7">
                      Remaining changes: {policy.changesRemaining}. The active cooldown and limit are enforced from your
                      account policy in the database.
                    </p>
                    <p className="mt-2 leading-7">
                      {policy.canChangeNow
                        ? "Your next username update is available now."
                        : `Your username is locked until ${formatDateTime(policy.nextAllowedAt)}.`}
                    </p>
                    {!policy.migrationInstalled ? (
                      <p className="mt-2 font-medium text-[#b54a1a] dark:text-[#ffb086]">
                        Username changes are currently unavailable until the policy table is available for this account.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#ece8f2] pt-8 dark:border-[#2d2345] sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#8f8aa0] transition-colors hover:text-[#34058d] dark:text-[#a89dc4] dark:hover:text-[#f4eeff]"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center rounded-2xl bg-[#34058d] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(52,5,141,0.22)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <div className="overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)] p-6 text-white shadow-[0_24px_60px_rgba(52,5,141,0.2)]">
          <span className="inline-flex rounded-full bg-[#fcdf46] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#5e4a00]">
            Account identity
          </span>
          <h3 className="mt-5 font-headline text-[1.8rem] font-extrabold tracking-[-0.04em]">{profile.displayName}</h3>
          <p className="mt-1 text-sm text-white/72">@{profile.username}</p>
          <div className="mt-8 grid gap-4 rounded-[1.5rem] bg-white/10 p-4 backdrop-blur">
            <div>
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.24em] text-white/58">Email</p>
              <p className="mt-2 text-sm font-semibold">{profile.email}</p>
            </div>
            <div>
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.24em] text-white/58">Location</p>
              <p className="mt-2 text-sm font-semibold">{[profile.city, profile.country].filter(Boolean).join(", ") || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_12px_35px_rgba(52,5,141,0.06)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_18px_36px_rgba(0,0,0,0.24)]">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#938da7] dark:text-[#a89dc4]">Security</p>
            <p className="mt-2 text-lg font-black text-[#34058d] dark:text-[#f4eeff]">Strong</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_12px_35px_rgba(52,5,141,0.06)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_18px_36px_rgba(0,0,0,0.24)]">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#938da7] dark:text-[#a89dc4]">Identity</p>
            <p className="mt-2 text-lg font-black text-[#34058d] dark:text-[#f4eeff]">{profile.verified ? "Verified" : "Pending"}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#f2e9b5] bg-[#fff8dc] p-5 dark:border-[#5d4a09] dark:bg-[#2c2307]">
          <p className="font-headline text-lg font-bold text-[#7a6300] dark:text-[#ffe38a]">Username policy</p>
          <p className="mt-2 text-sm leading-7 text-[#866f0a] dark:text-[#f6dc85]">
            {policy.migrationInstalled
              ? `Remaining changes: ${policy.changesRemaining}. The next available username edit follows the policy currently stored for this account.`
              : "Username changes will appear here once the account policy record is available."}
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#9f8100] dark:text-[#ffebac]">
            Next available change: {formatDateTime(policy.nextAllowedAt)}
          </p>
        </div>
      </aside>
    </div>
  );
}
