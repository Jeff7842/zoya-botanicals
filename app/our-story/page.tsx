"use client";

import Image from "next/image";
import "@/components/css/main.css";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Icon } from "@iconify/react";

const sourcePillars = [
  {
    icon: "mdi:leaf",
    title: "Wild-Crafted Integrity",
    text: "We source botanicals from regenerative ecosystems where nature leads and potency is preserved at harvest.",
    tags: ["Organic", "Sustainable"],
  },
];

const sciencePoints = [
  {
    icon: "material-symbols-light:biotech-outline-rounded",
    title: "Molecular Stability",
    text: "Our extraction systems protect fragile active compounds so efficacy stays intact from source to shelf.",
  },
  {
    icon: "mdi:check-decagram-outline",
    title: "Third-Party Verification",
    text: "Every batch is independently reviewed for purity, safety, and formulation integrity.",
  },
];

const testimonials = [
  {
    name: "Elena Moretti",
    role: "Botanical Archivist",
    text: "The precision in their extraction is obvious from the first use. It feels elevated, disciplined, and deeply intentional.",
    featured: false,
  },
  {
    name: "Dr. Julian Sterling",
    role: "Clinical Nutritionist",
    text: "ZOYA sits at the intersection of deep herbal intelligence and measurable performance. That is rare, and they execute it well.",
    featured: true,
  },
  {
    name: "Marcus Vance",
    role: "Holistic Practitioner",
    text: "In a category flooded with noise, their wild-crafted discipline feels genuinely revolutionary.",
    featured: false,
  },
];

export default function OurStoryPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--page-bg)] text-[var(--text-main)] transition-colors duration-500">
      <Navbar />

      <main className="pt-24">
        {/* HERO */}
        <section className="relative overflow-hidden px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-12">
            <div className="zoya-reveal zoya-reveal-up md:col-span-7">
              <span className="mb-6 block text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--brand-primary-soft)]">
                Our Story
              </span>

              <h1 className="text-5xl font-extrabold leading-[0.92] tracking-[-0.05em] text-[var(--brand-primary)] md:text-7xl xl:text-[5.5rem]">
                Cultivating
                <br />
                <span className="italic text-[var(--brand-accent)]">Radical</span>
                <br />
                Wellness.
              </h1>

              <p className="mt-8 max-w-xl text-base leading-8 text-[var(--text-muted)] md:text-lg">
                At ZOYA, wellness is not a trend product. It is a curated ritual built on
                botanical intelligence, clinical discipline, and deliberate formulation.
              </p>
            </div>

            <div className="zoya-reveal zoya-reveal-right relative md:col-span-5">
              <div className="relative ml-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden rounded-[1.2rem] bg-[var(--surface-card)] shadow-[0_24px_80px_rgba(52,5,141,0.14)]">
                <Image
                  src="/images/zoya/ingredients-shot.jpg"
                  alt="Botanical leaves"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(52,5,141,0.08)_0%,rgba(75,43,163,0.04)_100%)]" />
              </div>

              <div className="absolute -bottom-8 left-0 hidden h-40 w-40 overflow-hidden rounded-[1rem] border-[6px] border-[var(--surface-card)] bg-[var(--surface-card)] shadow-[0_20px_50px_rgba(0,0,0,0.18)] md:block">
                <Image
                  src="/images/zoya/hero-bottle.jpg"
                  alt="ZOYA product"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* THE SOURCE */}
        <section className="bg-[var(--surface-soft)] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14">
              <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-[var(--brand-primary)] md:text-6xl">
                The Source
              </h2>
              <div className="mt-4 h-1 w-24 rounded-full bg-[var(--brand-accent)]" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="zoya-reveal rounded-[1.5rem] bg-[var(--surface-card)] p-8 shadow-[0_18px_45px_rgba(52,5,141,0.06)] md:col-span-2 md:min-h-[22rem]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand-primary)]">
                  <Icon icon={sourcePillars[0].icon} width="26" height="26" />
                </div>

                <h3 className="text-2xl font-extrabold tracking-[-0.02em] text-[var(--brand-primary)] md:text-3xl">
                  {sourcePillars[0].title}
                </h3>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
                  {sourcePillars[0].text}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {sourcePillars[0].tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--brand-accent)] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#4e3a00]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="zoya-reveal flex min-h-[22rem] flex-col items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)] p-8 text-center text-white shadow-[0_18px_45px_rgba(52,5,141,0.16)]">
                <p className="text-6xl font-black text-[var(--brand-accent)] md:text-7xl">0%</p>
                <h4 className="mt-3 text-lg font-extrabold uppercase tracking-[0.22em]">
                  Synthetics
                </h4>
                <p className="mt-3 max-w-xs text-sm leading-7 text-white/75">
                  Pure botanical performance without artificial fillers, diluted intent, or
                  cosmetic shortcuts.
                </p>
              </div>

              <div className="zoya-reveal group relative overflow-hidden rounded-[1.5rem] bg-[var(--surface-card)] shadow-[0_18px_45px_rgba(52,5,141,0.06)]">
                <div className="relative aspect-[5/4]">
                  <Image
                    src="/images/zoya/ingredients-shot.jpg"
                    alt="Sprouting botanicals"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="zoya-reveal relative overflow-hidden rounded-[1.5rem] bg-[#160f45] p-8 text-white shadow-[0_18px_45px_rgba(22,15,69,0.24)] md:col-span-2">
                <div className="relative z-10">
                  <h3 className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">
                    Ethical Lineage
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76 md:text-base">
                    Every formulation is traceable. We work with serious growers, disciplined
                    sourcing channels, and quality-first extraction systems so the end product
                    does not lose its story.
                  </p>

                  <button
                    type="button"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--brand-accent)] transition-all duration-500 hover:gap-3"
                  >
                    Read our transparency notes
                    <Icon icon="ic:round-arrow-forward" width="18" height="18" />
                  </button>
                </div>

                <Icon
                  icon="mdi:earth"
                  width="180"
                  height="180"
                  className="absolute -bottom-8 -right-6 text-white/5"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SCIENCE */}
        <section className="bg-[var(--surface-card)] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="zoya-reveal zoya-reveal-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-[var(--surface-soft)]">
                    <Image
                      src="/images/zoya/testimonial-glow.jpg"
                      alt="Botanical cell image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.2rem] bg-[var(--surface-soft)]">
                    <Image
                      src="/images/zoya/hero-bottle.jpg"
                      alt="Laboratory inspired bottle setup"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.2rem] bg-[var(--surface-soft)]">
                    <Image
                      src="/images/zoya/product-glow-drops.jpg"
                      alt="Clinical glassware"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-[var(--surface-soft)]">
                    <Image
                      src="/images/zoya/product-mist.jpg"
                      alt="Clean lab layout"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="zoya-reveal zoya-reveal-up">
              <span className="mb-5 block text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--brand-accent)]">
                Precision Bio-Science
              </span>

              <h2 className="text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] text-[var(--brand-primary)] md:text-6xl">
                Clinical
                <br />
                By Nature.
              </h2>

              <p className="mt-7 text-base leading-8 text-[var(--text-muted)] md:text-lg">
                We do not just test for purity. We test for synergy. Our internal
                formulation logic evaluates how botanical actives behave together, not in
                isolation, because performance is built in the interaction layer.
              </p>

              <div className="mt-8 space-y-6">
                {sciencePoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--brand-primary)]">
                      <Icon icon={item.icon} width="22" height="22" />
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-[var(--text-main)]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#2f2488_0%,#34058d_100%)] px-4 py-24 text-center md:px-8 md:py-32">
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/zoya/ingredients-shot.jpg"
              alt="Background texture"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="mb-8 flex justify-center text-[var(--brand-accent)]">
              <Icon icon="mdi:format-quote-open" width="54" height="54" />
            </div>

            <blockquote className="text-3xl font-medium italic leading-tight text-white md:text-5xl">
              “We don’t just sell supplements. We curate a deeper connection between your
              body and the botanical world.”
            </blockquote>

            <p className="mt-10 text-[11px] font-extrabold uppercase tracking-[0.26em] text-[var(--brand-accent)]">
              ZOYA Research, Nairobi
            </p>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-[var(--surface-soft)] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="mb-4 block text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
                  Refined Testimonials
                </span>
                <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-[var(--brand-primary)] md:text-6xl">
                  What Our Curators Say
                </h2>
              </div>

              <div className="hidden gap-3 md:flex">
                <button type="button" className="zoya-icon-btn" title="Previous">
                  <Icon icon="mynaui:arrow-left" width="22" height="22" />
                </button>
                <button type="button" className="zoya-icon-btn" title="Next">
                  <Icon icon="mynaui:arrow-right" width="22" height="22" />
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((item) => (
                <article
                  key={item.name}
                  className={[
                    "zoya-reveal rounded-[1.5rem] p-8 transition-all duration-500",
                    item.featured
                      ? "relative overflow-hidden bg-[linear-gradient(135deg,#1d145a_0%,#34058d_100%)] text-white shadow-[0_24px_60px_rgba(52,5,141,0.22)]"
                      : "bg-[var(--surface-card)] text-[var(--text-main)] shadow-[0_18px_45px_rgba(52,5,141,0.06)] hover:-translate-y-1",
                  ].join(" ")}
                >
                  {item.featured && (
                    <Icon
                      icon="mdi:spa-outline"
                      width="120"
                      height="120"
                      className="absolute -right-3 -top-3 text-white/5"
                    />
                  )}

                  <div className="relative z-10">
                    <div className="mb-6 flex gap-1 text-[var(--brand-accent)]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon key={i} icon="mdi:star" width="16" height="16" />
                      ))}
                    </div>

                    <p
                      className={[
                        "text-lg italic leading-8",
                        item.featured ? "text-white" : "text-[var(--text-main)]",
                      ].join(" ")}
                    >
                      “{item.text}”
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                      <div
                        className={[
                          "flex h-12 w-12 items-center justify-center rounded-full text-sm font-black",
                          item.featured
                            ? "bg-[var(--brand-accent)] text-[#3f2f00]"
                            : "bg-[var(--brand-primary)] text-white",
                        ].join(" ")}
                      >
                        {item.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <div>
                        <p
                          className={[
                            "text-sm font-extrabold",
                            item.featured ? "text-white" : "text-[var(--brand-primary)]",
                          ].join(" ")}
                        >
                          {item.name}
                        </p>
                        <p
                          className={[
                            "text-[11px] uppercase tracking-[0.18em]",
                            item.featured ? "text-white/65" : "text-[var(--text-muted)]",
                          ].join(" ")}
                        >
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 text-center md:px-8 md:py-28">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-[var(--brand-primary)] md:text-5xl">
              Start Your Journey.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--text-muted)]">
              Experience curated botanical science designed to make your daily ritual more
              disciplined, more elegant, and more effective.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="/shop" className="ripple-btn zoya-primary-btn">
                Explore Shop
              </a>
              <a href="/benefits" className="zoya-secondary-btn">
                View Benefits
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}