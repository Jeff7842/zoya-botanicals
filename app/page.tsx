/* eslint-disable react-hooks/refs */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import "@/components/css/main.css";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import Navbar from "@/components/navbar/navbar";

type Product = {
  id: number;
  name: string;
  slug: string;
  priceKes: number;
  category: string;
  badge: string;
  description: string;
  image: string;
  bg: string;
  inventory: number;
};


const products: Product[] = [
  {
    id: 1,
    name: "Pure Marine Collagen",
    slug: "pure-marine-collagen",
    priceKes: 6240,
    category: "collagens",
    badge: "Best Seller",
    description: "Cellular hydration, skin elasticity, and a cleaner daily ritual.",
    image: "/images/zoya/product-collagen.jpg",
    bg: "from-[#dff2ef] to-[#bfe4df]",
    inventory: 31,
  },
  {
    id: 2,
    name: "Botanical Glow Drops",
    slug: "botanical-glow-drops",
    priceKes: 8060,
    category: "botanicals",
    badge: "Eco-Conscious",
    description: "Plant-based retinol alternative with a precise evening finish.",
    image: "/images/zoya/product-glow-drops.jpg",
    bg: "from-[#7ebf98] to-[#5d9f77]",
    inventory: 18,
  },
  {
    id: 3,
    name: "Vital Flora Multi",
    slug: "vital-flora-multi",
    priceKes: 4550,
    category: "vitamins",
    badge: "Science-Backed",
    description: "24 essential botanical nutrients for modern daily performance.",
    image: "/images/zoya/product-vitamins.jpg",
    bg: "from-[#ff7b23] to-[#f15c00]",
    inventory: 54,
  },
  {
    id: 4,
    name: "Cellular Calm Tonic",
    slug: "cellular-calm-tonic",
    priceKes: 5390,
    category: "botanicals",
    badge: "New Ritual",
    description: "A restorative tonic for stressed skin and overstimulated schedules.",
    image: "/images/zoya/product-tonic.jpg",
    bg: "from-[#dfe9e3] to-[#bdd0c4]",
    inventory: 22,
  },
  {
    id: 5,
    name: "Biotin Renewal Capsules",
    slug: "biotin-renewal-capsules",
    priceKes: 3770,
    category: "vitamins",
    badge: "Daily Core",
    description: "Hair, skin, and nail support designed for disciplined consistency.",
    image: "/images/zoya/product-biotin.jpg",
    bg: "from-[#f7ca7c] to-[#eba53d]",
    inventory: 47,
  },
  {
    id: 6,
    name: "Botanical Barrier Mist",
    slug: "botanical-barrier-mist",
    priceKes: 4940,
    category: "botanicals",
    badge: "Limited Drop",
    description: "A fast-weightless hydration veil for mid-day recovery and glow.",
    image: "/images/zoya/product-mist.jpg",
    bg: "from-[#dfe0ea] to-[#c8cbdb]",
    inventory: 13,
  },
];

const stats = [
  { label: "Satisfied clients in Nairobi", value: 12000, suffix: "+" },
  { label: "Average product rating", value: 49, suffix: "/50" },
  { label: "Botanical actives excluded from fillers", value: 0, suffix: "%" },
  { label: "Orders delivered across Kenya", value: 4700, suffix: "+" },
];
const values = [
  {
    icon: <Icon icon="boxicons:leaf-alt" width="24" height="24" />,
    title: "Cruelty-Free",
    text: "Never tested on animals. Always ethical, direct, and clean.",
  },
  {
    icon: <Icon icon="mdi:recycle" width="24" height="24" />,
    title: "Eco-Friendly",
    text: "Glass packaging, cleaner shipping choices, and lower-waste rituals.",
  },
  {
    icon: (
      <Icon
        icon="material-symbols-light:biotech-outline-rounded"
        width="24"
        height="24"
      />
    ),
    title: "Science-Backed",
    text: "Botanical tradition sharpened by measurable formulation logic.",
  },
];

const socialLinks = [
                {icon: <Icon icon="mdi:earth" width="20" height="20" />, href: "https://zoyabotanicals.co.ke"},
                {icon: <Icon icon="material-symbols:share-outline" width="20" height="20" />, href: "mailto:hello@zoyabotanicals.co.ke"},
                {icon: <Icon icon="mdi:email-outline" width="20" height="20" />, href: "tel:+254700000000"},
              ]



function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function Counter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const start = performance.now();

    const frame = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }, [inView, value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  {/*const [theme, setTheme] = useState<"light" | "dark">("light");*/}
  const [loggedIn] = useState(false);
  const [username] = useState("Jeff");


  const statsView = useInView<HTMLDivElement>(0.3);

  const featuredProducts = useMemo(() => products.slice(0, 6), []);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)] transition-colors duration-500 overflow-x-hidden font-body">
      <Navbar/>
      <main>
        <section id="home" className="relative overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pb-28 md:pt-40">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] bg-[linear-gradient(180deg,rgba(52,5,141,0.06)_0%,rgba(75,43,163,0.02)_100%)] lg:block" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
            <div className="zoya-reveal zoya-reveal-up lg:col-span-6">
              <span className="mb-5 inline-flex rounded-full bg-[var(--brand-accent)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#5b4b00] shadow-[0_12px_30px_rgba(252,223,70,0.24)]">
                Purely Botanical
              </span>
              <h1 className="max-w-xl.5 text-5xl font-extrabold font-headline leading-[1] tracking-[-0.05em] text-[var(--brand-primary)] sm:text-6xl md:text-7xl xl:text-[5.6rem]">
                Revitalize with <span className="text-[var(--brand-primary-light)]">ZOYA</span> Botanicals
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--text-muted)] md:text-lg">
                Precision-led botanical care for the modern Kenyan ritual. Clean formulations, high-end wellness,
                and clinical calm designed for people who want results without noise.
              </p>

              <div className="mt-8 flex flex-wrap gap-6 ">
                <a href="#shop" className="ripple-btn zoya-primary-btn ">
                  Shop Now
                </a>
                <a href="#story" className="ripple-btn zoya-secondary-btn">
                  View Rituals
                </a>
              </div>
            </div>

            <div className="zoya-reveal zoya-reveal-right relative lg:col-span-6 lg:pl-10">
              <div className="relative mx-auto aspect-[5/6] max-w-[29rem] overflow-hidden rounded-[2rem] bg-[#dbe9df] shadow-[0_25px_80px_rgba(52,5,141,0.12)]">
                <Image
                  src="/images/zoya/hero-bottle.jpg"
                  alt="ZOYA Botanicals hero product"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-5 left-0 rounded-2xl bg-[var(--brand-accent)] px-5 py-4 shadow-[0_18px_40px_rgba(52,5,141,0.12)]">
                <p className="text-2xl font-black text-[#352200]">98%</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6c5b00]">Bio-availability</p>
              </div>
            </div>
          </div>
        </section>

        <section ref={statsView.ref} className="px-4 py-8 md:px-8 md:py-14">
          <div className="mx-auto grid grid-cols-2 max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item, index) => (
              <div
                key={item.label}
                className="zoya-reveal rounded-[1.75rem] bg-[var(--surface-card)] p-6 shadow-[0_16px_50px_rgba(52,5,141,0.06)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01]"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="mb-3 text-4xl font-extrabold tracking-[-0.04em] text-[var(--brand-primary)]">
                  <Counter value={item.value} suffix={item.suffix} inView={statsView.inView} />
                </div>
                <p className="text-sm leading-6 text-[var(--text-muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="shop" className="px-4 py-14 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div className="zoya-reveal zoya-reveal-up">
                <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-[var(--brand-primary)] md:text-4xl">
                  Signature Formulations
                </h2>
                <p className="mt-2 text-[var(--text-muted)]">The core of our botanical intelligence. Scroll horizontally.</p>
              </div>
              <a href="/shop" className="group inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] transition-all duration-500 hover:text-[var(--brand-primary-soft)]">
                Explore Collection
                <span className="material-symbols-outlined text-[18px] transition-transform duration-500 group-hover:translate-x-1">
                  <Icon icon="ic:round-arrow-forward" width="24" height="24" />
                </span>
              </a>
            </div>

            <div className="zoya-scroll-row pb-4">
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group min-w-[18rem] max-w-[24rem] flex-none rounded-[1.6rem] bg-[var(--surface-card)] py-3 px-1 shadow-[0_18px_45px_rgba(52,5,141,0.07)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]"
                >
                  <div className={`relative mb-4 aspect-[5/5] overflow-hidden rounded-[1rem] bg-gradient-to-br ${product.bg}`}>
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-[rgba(255,255,255,0.82)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)] dark:text-[#34058d] backdrop-blur-md">
                      {product.badge}
                    </div>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:grayscale"
                    />
                  </div>
                  <div className="px-4 pb-3 pt-2">
                    <h3 className="text-xl font-extrabold tracking-[-0.02em] text-[var(--brand-primary)] transition-colors duration-500 group-hover:text-[var(--brand-primary-soft)]">
                      {product.name}
                    </h3>
                    <p className="mt-2 min-h-[3rem] text-sm leading-6 text-[var(--text-muted)]">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-[var(--text-main)]">{formatKes(product.priceKes)}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{product.category}</p>
                      </div>
                      <button
                        type="button"
                        className="ripple-btn rounded-full bg-[var(--brand-accent)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#563f00] transition-all duration-500 hover:bg-[var(--brand-primary)] hover:text-white"
                        data-product-id={product.id}
                        data-product-slug={product.slug}
                        data-inventory={product.inventory}
                      >
                        <span className="flex justify-center items-center spcae-between space-x-2"><Icon icon="ic:round-add" width="20" height="20" className="shrink-0"/>Add</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="story" className="px-4 py-14 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
            <div className="zoya-reveal zoya-reveal-left relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[var(--surface-card)] p-6 shadow-[0_18px_50px_rgba(52,5,141,0.07)]">
                <Image
                  src="/images/zoya/ingredients-shot.jpg"
                  alt="Botanical ingredients"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-6 left-10 max-w-[15rem] rounded-[1.2rem] bg-[var(--brand-primary)] p-6 text-white shadow-[0_22px_50px_rgba(52,5,141,0.22)]">
                <p className="text-4xl font-black dark:text-[#34058d]">0%</p>
                <p className="mt-2 text-xs font-bold uppercase leading-6 tracking-[0.15em] text-white/82 dark:text-[#1a1c1e]">
                  Synthetic fillers, artificial colors, or questionable preservatives.
                </p>
              </div>
            </div>

            <div className="zoya-reveal zoya-reveal-up">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#8a7400]">The ZOYA Difference</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] text-[var(--brand-primary)] md:text-6xl">
                Curation as a Form of Art.
              </h2>
              <p className="mt-6 text-base leading-8 text-[var(--text-muted)] md:text-lg">
                We do not push generic wellness. We curate potent botanicals with a gallery mindset: fewer distractions,
                cleaner ingredient architecture, and formulas that feel deliberate from the first use to the last drop.
              </p>
              <p className="mt-5 italic leading-8 text-[var(--text-muted)]">
                “Beauty is not a routine, it is a bio-rhythm we help you rediscover.”
              </p>
              <a href="/our-process" className="mt-8 inline-flex items-center gap-4 text-[var(--brand-primary)] transition-all duration-500 hover:gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-[0_15px_35px_rgba(52,5,141,0.18)]">
                  <span className="material-symbols-outlined"><Icon icon="ri:play-line" width="24" height="24" /></span>
                </span>
                <span className="text-xs font-black uppercase tracking-[0.18em]">Our Process Film</span>
              </a>
            </div>
          </div>
        </section>

        <section
  id="benefits"
  className="bg-[var(--surface-soft)] px-4 py-14 md:px-8 md:py-16"
>
  <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
    {values.map((item, index) => (
      <div
        key={item.title}
        className="zoya-reveal flex flex-col items-center rounded-[1.5rem] px-6 py-6 text-center transition-all duration-500 hover:-translate-y-1"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-card)] text-[var(--brand-primary)] shadow-[0_10px_30px_rgba(52,5,141,0.08)]">
          {item.icon}
        </div>

        <h3 className="text-lg font-extrabold text-[var(--brand-primary)]">
          {item.title}
        </h3>

        <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-muted)]">
          {item.text}
        </p>
      </div>
    ))}
  </div>
</section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
            <div className="zoya-reveal zoya-reveal-left lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8a7400]">Voices of Resonance</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1] tracking-[-0.04em] text-[var(--brand-primary)] md:text-5xl">
                Shared Stories of Renewal.
              </h2>
              <div className="mt-8 border-l-4 border-[var(--brand-accent)] pl-6">
                <p className="text-xl italic leading-9 text-[var(--text-main)]">
                  “Integrating ZOYA into my morning ritual has felt less like a habit and more like a return to myself.
                  The glow is undeniable, but the feeling of vitality is what truly lingers.”
                </p>
                <div className="mt-6">
                  <p className="text-sm font-extrabold text-[var(--brand-primary)]">Elena Rostova</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Architect & Aesthetician
                  </p>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button className="zoya-icon-btn" type="button" title='left arrow'>
                  <span className="material-symbols-outlined text-[18px]"><Icon icon="mynaui:arrow-left" width="24" height="24" /></span>
                </button>
                <button className="zoya-icon-btn" type="button" title='right arrow'>
                  <span className="material-symbols-outlined text-[18px]"><Icon icon="mynaui:arrow-right" width="24" height="24" /></span>
                </button>
              </div>
            </div>

            <div className="zoya-reveal zoya-reveal-right lg:col-span-7">
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-2">
                <div className="space-y-4 pt-10">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-[var(--surface-card)] shadow-[0_18px_50px_rgba(52,5,141,0.07)]">
                    <Image src="/images/zoya/testimonial-glow.jpg" alt="Botanical glow" fill className="object-cover" />
                  </div>
                  <div className="rounded-[1.25rem] bg-[var(--brand-primary)] p-6 text-white shadow-[0_18px_40px_rgba(52,5,141,0.15)]">
                    <p className="bright-title text-3xl font-black text-white dark:text-[#34058d]">4.9/5</p>
                    <p className=" bright-detail mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 dark:text-[#1a1c1e]">Average Rating</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[1.25rem] bg-[var(--brand-accent)] p-6 text-[#513f00] shadow-[0_15px_36px_rgba(252,223,70,0.22)]">
                    <span className="material-symbols-outlined text-[30px]"><Icon icon="mdi:star-outline" width="40" height="40" /></span>
                    <p className="mt-3 text-lg font-bold leading-8">“A masterclass in botanical potency.”</p>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-[var(--surface-card)] shadow-[0_18px_50px_rgba(52,5,141,0.07)]">
                    <Image src="/images/zoya/testimonial-lifestyle.jpg" alt="Natural life" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-[2rem] bg-[var(--brand-primary)] p-8 text-white shadow-[0_24px_60px_rgba(52,5,141,0.18)] lg:col-span-2">
              <div className="relative z-10">
                <h3 className="bright-title text-3xl font-extrabold tracking-[-0.03em] dark:text-[#34058d]">Join the Collective</h3>
                <p className="bright-detail mt-3 max-w-xl text-sm leading-7 text-white/76 dark:text-[#1a1c1e]" >
                  Get early access to limited seasonal drops, ritual notes, and high-intent botanical updates from Nairobi.
                </p>
                <form className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="email@address.com"
                    className="min-h-12 flex-1 rounded-xl border border-white/20 dark:border-black/20 bg-white/10 dark:bg-white/30 px-4 py-3 text-sm text-white dark:text-[#1a1c1e] dark:placeholder:text-[#3d3d3d]  placeholder:text-white/55 outline-none transition-all duration-500 focus:border-[var(--brand-accent)]"
                  />
                  <button type="submit" className="ripple-btn rounded-xl bg-[var(--brand-accent)] px-6 py-3 font-extrabold text-[#4c3800] transition-all duration-500 hover:bg-white">
                    Join Now
                  </button>
                </form>
              </div>
              <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-[linear-gradient(135deg,#4b2ba3_0%,#34058d_100%)] opacity-40 blur-3xl" />
            </div>

            <div className="rounded-[2rem] bg-[var(--brand-accent)] p-8 text-center shadow-[0_24px_55px_rgba(252,223,70,0.16)]">
              <span className="material-symbols-outlined flex text-5xl text-[#6c5b00] text-center items-center justify-center"><Icon icon="ic:outline-loyalty" width="54" height="54" className="items-center justify-center"/></span>
              <h3 className="mt-6 text-2xl font-extrabold text-[#473600]">Rewards Program</h3>
              <p className="mt-3 text-sm leading-7 text-[#715b00]">Earn petals for every purchase and redeem them for curated gifts.</p>
              <a href="/rewards" className="mt-6 inline-flex text-sm font-bold underline underline-offset-4 text-[#4c3a00]">
                Learn More
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="mt-10 bg-[var(--footer-bg)] px-4 py-12 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-[0.16em]">ZOYA Botanicals</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/66">
              Defining the future of botanical wellness through curated precision and premium natural science.
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((item, index) => (
                <a
                  key={item.href}
                  style={{ animationDelay: `${index * 120}ms` }}
                  href={item.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-all duration-500 hover:bg-white/10 hover:-translate-y-1"
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </a>
              ))}
            </div>

            <div className="mt-8 max-w-sm rounded-[1.2rem] bg-white/5 p-4 backdrop-blur-lg">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-accent)]">Subscribe newsletter</p>
              <form className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white placeholder:text-white/45 outline-none"
                />
                <button className="ripple-btn rounded-xl bg-[var(--brand-accent)] px-4 text-xs font-black uppercase tracking-[0.14em] text-[#4e3a00] transition-all duration-500 hover:bg-white" type="submit">
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-accent)]">Shop</h3>
              <ul className="space-y-4 text-sm text-white/64">
                <li><a className="transition-all duration-500 hover:text-white" href="/shop">All Products</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/shop/collagens">Collagens</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/shop/vitamins">Vitamins</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/shop/botanicals">Botanicals</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-accent)]">Support</h3>
              <ul className="space-y-4 text-sm text-white/64">
                <li><a className="transition-all duration-500 hover:text-white" href="/faq">FAQ</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/shipping">Shipping</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/returns">Returns</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/privacy-policy">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-accent)]">Legal</h3>
              <ul className="space-y-4 text-sm text-white/64">
                <li><a className="transition-all duration-500 hover:text-white" href="/terms">Terms Page</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/privacy-policy">Privacy Policy</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/contact">Nairobi, Kenya</a></li>
                <li><a className="transition-all duration-500 hover:text-white" href="/login">Login</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.18em] text-white/40 md:flex-row md:items-center">
          <p>© 2026 ZOYA Botanicals. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-xl">🇰🇪</span>
            <span>Curated in Nairobi, Kenya. Sourced globally.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
