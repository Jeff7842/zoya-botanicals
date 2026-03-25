
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import "@/components/css/main.css";
import "@/components/css/signup.css";

type ReceivedPageProps = {
  searchParams?: Promise<{
    ref?: string;
  }>;
};

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
  const minute = String(date.getMinutes()).padStart(2, "0");
  const isoDay = String(getIsoWeekday(date));
  const yearLastDigit = String(date.getFullYear()).slice(-1);

  return `#${firstLetter}${secondLetter}-${minute}${isoDay}${yearLastDigit}`;
}



export async function ReceivedPage({ searchParams }: ReceivedPageProps) {
  const params = await searchParams;
  const reference = params?.ref || generateInquiryReference();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--page-bg)] text-[var(--text-main)] transition-colors duration-500">
      <Navbar />

      <main className="relative flex min-h-screen items-center px-4 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgba(252,223,70,0.12)_0%,rgba(252,223,70,0)_20%),radial-gradient(circle_at_74%_30%,rgba(52,5,141,0.06)_0%,rgba(52,5,141,0)_28%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-2">
          <div className="zoya-reveal zoya-reveal-left relative mx-auto w-full max-w-[29rem]">
            <div className="absolute -left-10 top-8 h-36 w-36 rounded-full bg-[var(--brand-accent)]/18 blur-3xl" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[var(--surface-soft)] shadow-[0_26px_70px_rgba(52,5,141,0.12)]">
              <Image
                src="/images/zoya/ingredeents-shot.png"
                alt="Botanical product arrangement"
                fill
                className="object-cover transition-all duration-700 hover:scale-[1.03]"
                priority
              />
            </div>

            <div className="absolute -bottom-5 right-[-0.8rem] rounded-[0.525rem] bg-[var(--brand-accent)] px-6 py-5 text-[14px] font-semibold uppercase tracking-[0.2em] text-[#5d4a00] shadow-[0_18px_45px_rgba(252,223,70,0.22)] rotate-[3deg]">
              Pure Essence
            </div>
          </div>

          <div className="zoya-reveal zoya-reveal-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)]/8 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              Submission Received
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-extrabold leading-[0.94] tracking-[-0.06em] text-[var(--brand-primary)] md:text-6xl lg:text-[5rem]">
              Your Message is <span className="text-(--brand-primary-light) font-zoya-second">Blooming.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-9 text-[var(--text-muted)]">
              A botanical curator will review your message and respond within 24-48 business hours.
              Thank you for seeking balance with us.
            </p>

            <div className="mt-8 rounded-[1.5rem] bg-[var(--surface-card)] p-6 shadow-[0_18px_50px_rgba(52,5,141,0.06)] ring-1 ring-[var(--ghost-border)] md:p-7">
              <div className="border-l-[4px] border-[#9b8300] pl-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Inquiry Reference
                </p>
                <p className="mt-3 text-2xl font-extrabold font-headline tracking-[-0.01em] text-[var(--brand-primary)]">
                  {reference}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/shop" className="ripple-btn zoya-primary-btn rounded-[1rem] px-8 py-4 text-center text-base normal-case tracking-normal">
                Return to Shop
              </Link>
              <Link href="/our-story" className="zoya-secondary-btn rounded-[1rem] px-8 py-4 text-center text-base normal-case tracking-normal">
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}