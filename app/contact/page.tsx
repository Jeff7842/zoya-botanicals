"use client";

/*
  Split this file into:
  1) app/contact/page.tsx
  2) app/contact/received/page.tsx

  It is written to match your current ZOYA stack:
  - Navbar and Footer reused
  - main.css variables reused
  - next-themes compatible
  - same editorial font direction from homepage
  - contact page structure based on code.html + screen.png
  - received page structure based on recevied.html + received.png

  POSTGRESQL / TRIGGER NOTE FOR AUTO-GENERATING INQUIRY REFERENCES
  ---------------------------------------------------------------
  Desired format example: #AB-3456

  Rule:
  - Starts with #
  - First 2 characters are letters:
      1st letter = systematic A-Z value
      2nd letter = random A-Z value
  - Then a hyphen
  - Then 4 digits:
      first two digits = minute sent (00-59)
      third digit = ISO weekday (1-7, Monday=1, Sunday=7)
      fourth digit = last digit of year (e.g. 2026 => 6)

  Suggested DB-side logic:
  - systematic first letter can be generated from current minute or a sequence modulo 26
  - random second letter via random ASCII 65-90
  - digits from CURRENT_TIMESTAMP

  Example pseudo-expression:
  '#' || first_letter || random_letter || '-' || to_char(now(), 'MI') || isodow || right(extract(year from now())::text, 1)

  If you want real PostgreSQL trigger/function SQL next, ask and I’ll write the exact trigger.
*/

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import "@/components/css/main.css";
import "@/components/css/signup.css";

type InquiryType =
  | "Product Inquiry"
  | "Shipping & Delivery"
  | "Wholesale & Partnerships"
  | "Press & Media"
  | "Returns & Support";

type FAQItem = {
  question: string;
  answer: string;
};

type ContactFormState = {
  fullName: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
  acceptTerms: boolean;
};

type ToastState = {
  show: boolean;
  title: string;
  message: string;
};

const inquiryOptions: InquiryType[] = [
  "Product Inquiry",
  "Shipping & Delivery",
  "Wholesale & Partnerships",
  "Press & Media",
  "Returns & Support",
];

const faqs: FAQItem[] = [
  {
    question: "Where do you source your botanical ingredients?",
    answer:
      "We work with trusted growers and formulation partners who align with clean ingredient standards, traceability, and regenerative sourcing principles wherever possible.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "We currently prioritize Kenya and selected international routes. Shipping availability is confirmed at checkout or through support for special destination requests.",
  },
  {
    question: "What is your return policy for open products?",
    answer:
      "Opened products are reviewed case by case for safety and product integrity. If there is a defect, transit issue, or formulation concern, our team will guide the next step quickly.",
  },
];

const testimonials = [
  {
    quote:
      "The personalized consultation helped me rebuild my morning routine. Their botanical knowledge is truly world-class.",
    name: "Elena Martinez",
    role: "Daily Ritual User",
    initials: "EM",
  },
  {
    quote:
      "I’ve never seen such transparency in sourcing. Zoya’s commitment to regenerative farming is inspiring.",
    name: "David Kwong",
    role: "Botanical Enthusiast",
    initials: "DK",
  },
  {
    quote:
      "Customer support that actually cares. They went above and beyond to help me find the right blend.",
    name: "Sarah Reed",
    role: "Verified Customer",
    initials: "SR",
  },
];

const socialLinks = [
  {
    href: "https://zoyabotanicals.co.ke",
    icon: "mdi:earth",
    label: "Website",
  },
  {
    href: "https://instagram.com",
    icon: "mdi:instagram",
    label: "Instagram",
  },
  {
    href: "mailto:hello@zoyabotanicals.co.ke",
    icon: "mdi:email-outline",
    label: "Email",
  },
];

function getIsoWeekday(date: Date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function getSystemLetter(date: Date) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const index = (date.getMinutes() + getIsoWeekday(date) + date.getFullYear()) % 26;
  return alphabet[index];
}

function getRandomLetter() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function generateInquiryReference(date = new Date()) {
  const firstLetter = getSystemLetter(date);
  const secondLetter = getRandomLetter();
  const thirdLetter = getRandomLetter();
  const fourthLetter = getRandomLetter();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const isoDay = String(getIsoWeekday(date));
  const yearLastDigit = String(date.getFullYear()).slice(-1);

  return `#${firstLetter}${secondLetter}-${minute}${isoDay}${yearLastDigit}-${thirdLetter}${fourthLetter}`;
}

function ContactToast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={`fixed right-4 top-24 z-[70] w-[calc(100%-2rem)] max-w-sm rounded-[1.4rem] bg-[var(--surface-card)] p-4 shadow-[0_20px_60px_rgba(52,5,141,0.16)] ring-1 ring-[var(--ghost-border)] transition-all duration-500 ${
        toast.show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-accent)] text-[#5b4b00] shadow-[0_12px_30px_rgba(252,223,70,0.24)]">
          <Icon icon="solar:check-circle-bold" width="20" height="20" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold tracking-[-0.02em] text-[var(--brand-primary)]">
            {toast.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto mt-28 max-w-4xl px-4 md:px-8">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#8a7400]">
          Knowledge Base
        </p>
        <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-[var(--brand-primary)] md:text-5xl">
          Frequent Inquiries
        </h2>
      </div>

      <div className="mt-12 space-y-3">
        {faqs.map((item, index) => {
          const open = openIndex === index;

          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-[1.5rem] bg-[var(--surface-card)] shadow-[0_10px_35px_rgba(52,5,141,0.05)] ring-1 ring-[var(--ghost-border)] transition-all duration-500"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left md:px-8 md:py-6"
                aria-expanded={open}
              >
                <span className="text-base font-bold tracking-[-0.02em] text-[var(--brand-primary)] md:text-lg">
                  {item.question}
                </span>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand-primary)] transition-all duration-500 ${
                    open ? "rotate-45" : "rotate-0"
                  }`}
                >
                  <Icon icon="ic:round-add" width="22" height="22" />
                </span>
              </button>

              <div
                className={`grid transition-all duration-500 ${
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-sm leading-7 text-[var(--text-muted)] md:px-8 md:pb-7 md:text-base">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/faq"
          className="group inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--brand-primary)] transition-all duration-500 hover:gap-3"
        >
          Visit our full help center
          <Icon
            icon="ic:round-arrow-forward"
            width="18"
            height="18"
            className="transition-transform duration-500 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}

function ContactSidebar() {
  return (
    <div className="zoya-reveal zoya-reveal-left space-y-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--brand-primary)]">
          Connect with <span className="text-(--brand-primary-light) text-4xl italic font-zoya-second tracking-wide">our</span>  Studio
        </h2>
      </div>

      <div className="space-y-14 rounded-[2rem] bg-[var(--surface-card)] p-6 shadow-[0_18px_45px_rgba(52,5,141,0.05)] ring-1 ring-[var(--ghost-border)] md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand-primary)]">
            <Icon icon="ic:outline-email" width="20" height="20" />
          </div>
          <div>
            <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Email Inquiry
            </p>
            <a
              href="mailto:hello@zoyabotanicals.com"
              className="mt-2 block text-lg font-normal  text-[var(--brand-primary)] tracking-[0.05em] transition-opacity duration-500 hover:opacity-75"
            >
              hello@zoyabotanicals.com
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand-primary)]">
            <Icon icon="solar:map-point-linear" width="20" height="20" />
          </div>
          <div>
            <p className="text-[10px] font-normal  uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Our Studio
            </p>
            <p className="mt-2 text-base font-normal leading-7 tracking-[0.05em] text-[var(--brand-primary)] md:text-lg">
              1248 Botanical Way, Suite 400
              <br />
              Portland, Oregon 97201
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand-primary)]">
            <Icon icon="solar:clock-circle-linear" width="20" height="20" />
          </div>
          <div>
            <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Consultation Hours
            </p>
            <p className="mt-2 text-base font-normal tracking-[0.05em] text-[var(--brand-primary)] md:text-lg">
              Mon — Fri: 9am - 6pm PST
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-[var(--surface-card)] p-6 shadow-[0_18px_45px_rgba(52,5,141,0.05)] ring-1 ring-[var(--ghost-border)] md:p-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[var(--text-muted)]">
          Social Garden
        </p>
        <div className="mt-5 flex gap-3">
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={item.label}
              className="zoya-icon-btn h-12 w-12 rounded-2xl"
            >
              <Icon icon={item.icon} width="20" height="20" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactFormCard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: "",
    message: "",
  });

  const [form, setForm] = useState<ContactFormState>({
    fullName: "",
    email: "",
    inquiryType: "Product Inquiry",
    message: "",
    acceptTerms: false,
  });

  const isValid = useMemo(() => {
    return (
      form.fullName.trim().length > 2 &&
      /^\S+@\S+\.\S+$/.test(form.email) &&
      form.message.trim().length > 10 &&
      form.acceptTerms
    );
  }, [form]);

  useEffect(() => {
    if (!toast.show) return;
    const timer = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2300);

    return () => window.clearTimeout(timer);
  }, [toast.show]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);

    const reference = generateInquiryReference();

    // Replace with your real API / Server Action call.
    // Example payload for PostgreSQL insert:
    // { ...form, inquiryReference: reference, createdAt: new Date().toISOString() }
    await new Promise((resolve) => setTimeout(resolve, 950));

    setToast({
      show: true,
      title: "Message sent successfully",
      message: `Your inquiry reference is ${reference}`,
    });

    setTimeout(() => {
      router.push(`/contact/received?ref=${encodeURIComponent(reference)}`);
    }, 850);
  };

  return (
    <>
      <ContactToast toast={toast} />

      <div className="zoya-reveal zoya-reveal-right rounded-[2rem] bg-[var(--surface-card)] p-6 shadow-[0_26px_70px_rgba(52,5,141,0.08)] ring-1 ring-[var(--ghost-border)] md:p-10 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormField
            id="fullName"
            name="fullName"
            label="Full Name"
            icon="solar:user-linear"
          >
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="contact-input"
              required
            />
          </FormField>

          <FormField
            id="email"
            name="email"
            label="Email Address"
            icon="ic:outline-email"
          >
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="hello@example.com"
              className="contact-input"
              required
            />
          </FormField>

          <FormField
            id="inquiryType"
            name="inquiryType"
            label="Inquiry Type"
            icon="ic:outline-chat-bubble-outline"
          >
            <select
              id="inquiryType"
              name="inquiryType"
              value={form.inquiryType}
              onChange={handleChange}
              className="contact-input cursor-pointer appearance-none"
            >
              {inquiryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <Icon icon="solar:alt-arrow-down-linear" width="20" height="20" />
            </span>
          </FormField>

          <FormField
            id="message"
            name="message"
            label="Your Message"
            icon="fluent:pen-24-regular"
          >
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help you flourish?"
              className="contact-input min-h-[130px] resize-none"
              required
            />
          </FormField>

          <div className="checkbox-wrapper-46 bg-[var(--surface-soft)] px-4 py-4 flex items-start gap-3 rounded-[1.25rem] text-sm leading-6">
  <input
    id="acceptTerms"
    name="acceptTerms"
    type="checkbox"
    checked={form.acceptTerms}
    onChange={handleChange}
    className="inp-cbx"
  />

  <label htmlFor="acceptTerms" className="cbx">
    <span className="cbx-box">
      <svg width="12px" height="10px" viewBox="0 0 12 10">
        <polyline points="1.5 6 4.5 9 10.5 1" />
      </svg>
    </span>

    <span className="flex-1 text-sm leading-6 text-[var(--text-muted)]">
      I accept the
      <Link
        href="/user/terms"
        className="mx-1 font-bold text-[var(--brand-primary)] hover:underline"
      >
        Terms & Agreement
      </Link>
      and
      <Link
        href="/user/privacy"
        className="ml-1 font-bold text-[var(--brand-primary)] hover:underline"
      >
        Privacy Policy
      </Link>
      .
    </span>
  </label>
</div>

          <div className="space-y-4 pt-1">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="ripple-btn zoya-primary-btn flex w-full items-center justify-center gap-3 rounded-[1rem] px-6 py-4 text-sm uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-55 disabled:grayscale disabled:hover:grayscale"
            >
              {submitting ? (<span className="inline-flex items-center gap-3">
    <div className="size-4 animate-spin rounded-full border-2 border-white/90 border-t-transparent" />
    <span>Processing...</span>
  </span>) : (<span className="inline-flex gap-2 items-center justify-center">Send Message <Icon icon="ic:round-arrow-forward" width="20" height="18" /></span>) }
              
            </button>

            <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Response within 24-48 business hours
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .contact-input {
          width: 100%;
          border: 0;
          border-bottom: 1px solid var(--ghost-border);
          background: transparent;
          padding: 0.8rem 0 0.9rem;
          color: var(--text-main);
          outline: none;
          transition: border-color 300ms ease, color 300ms ease;
        }

        .contact-input::placeholder {
          color: var(--text-muted);
          opacity: 0.55;
        }

        .contact-input:focus {
          border-bottom-color: var(--brand-primary);
        }
      `}</style>
    </>
  );
}

function FormField({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  name: string;
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[var(--brand-primary)]">
        <Icon icon={icon} width="18" height="18" />
        <label
          htmlFor={id}
          className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[var(--text-muted)]"
        >
          {label}
        </label>
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}

function TestimonialSection() {
  return (
    <section className="mt-28 bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#fcdf46]">
            Curator Feedback
          </p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
            Loved by the community
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className="zoya-reveal rounded-[1.7rem] border border-white/10 bg-white/6 p-6 text-white shadow-[0_20px_55px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="mb-5 flex gap-1 text-[#fcdf46]">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Icon key={starIndex} icon="material-symbols:star" width="18" height="18" />
                ))}
              </div>

              <p className="min-h-[120px] text-sm italic leading-7 text-white/88 md:text-base">
                “{item.quote}”
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fcdf46]/18 text-xs font-extrabold text-[#fcdf46]">
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--page-bg)] text-[var(--text-main)] transition-colors duration-500">
      <Navbar />

      <main className="pb-20 pt-28 md:pt-32">
        <section className="px-4 pb-4 pt-4 md:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <div className="zoya-reveal zoya-reveal-up inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent)]/20 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#8a7400] shadow-[0_10px_26px_rgba(252,223,70,0.14)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a482ff] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#a482ff] opacity-70" />
              </span>
              Get in Touch
            </div>

            <h1 className="zoya-reveal zoya-reveal-up mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-[-0.06em] text-[var(--brand-primary)] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              How can we help <span className="text-[var(--brand-primary-light)] text-8xl font-zoya">you</span>  flourish?
            </h1>

            <p className="zoya-reveal zoya-reveal-up mx-auto mt-8 max-w-2xl text-base leading-8 text-[var(--text-muted)] md:text-lg">
              Whether you’re curious about our botanical sourcing or need assistance with your daily routine,
              our experts are here to guide your journey.
            </p>
          </div>
        </section>

        <section className="px-4 pt-12 md:px-8 md:pt-16">
          <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[1.1fr_1.45fr] lg:gap-10">
            <ContactSidebar />
            <ContactFormCard />
          </div>
        </section>

        <TestimonialSection />
        <FAQAccordion />
      </main>

      <Footer />
    </div>
  );
}

export default ContactPage;
