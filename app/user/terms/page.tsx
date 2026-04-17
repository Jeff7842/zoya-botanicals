'use client'

import AccountTitleBadge from "@/components/account/title-badge";
import  Header from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

export default function TermsPage() {
    return (
        <>
        <Header/>
        <div className="mx-auto pt-8 flex max-w-7xl flex-col gap-12 lg:flex-row">
                <aside className="w-full lg:sticky lg:top-28 lg:w-72 lg:self-start">
                  <div className="rounded-[1.75rem] border border-[#ebe7f2] bg-white p-6 dark:border-white/10 dark:bg-[#120d21]">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7]">On this page</p>
                    <nav className="mt-6 space-y-3 text-sm text-[#6f6a7d] dark:text-[#b6abcf]">
                      <a href="#acceptance" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Acceptance of Terms</a>
                      <a href="#subscriptions" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Subscriptions</a>
                      <a href="#disclaimer" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Health Disclaimer</a>
                      <a href="#liability" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Limitation of Liability</a>
                    </nav>
                  </div>
                </aside>
        
                <article className="min-w-0 flex-1 space-y-10">
                  <header className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#faf8ff_0%,#f0eef5_100%)] p-8 dark:bg-[linear-gradient(135deg,#171126_0%,#0f091c_100%)] md:p-12">
                    <AccountTitleBadge icon="solar:document-text-linear" label="Legal Documentation" />
                    <h1 className="mt-6 font-headline text-[3.4rem] font-black leading-none tracking-[-0.06em] text-[#34058d] dark:text-[#f4eeff] md:text-[5.4rem]">
                      Terms of<br />Service.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      Welcome to the Zoya Botanicals community. These terms define how the account dashboard, purchases, and
                      site experience are used.
                    </p>
                  </header>
        
                  <section id="acceptance" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
                    <h2 className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">1. Acceptance of Terms</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      <p>
                        By accessing Zoya Botanicals, you agree to these Terms of Service and to use the website, account
                        dashboard, and checkout tools responsibly.
                      </p>
                      <p>
                        Continued use of the site after updates are published means you accept the revised terms in effect at
                        that time.
                      </p>
                    </div>
                  </section>
        
                  <div className="grid gap-6 md:grid-cols-2">
                    <section id="subscriptions" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
                      <h3 className="font-headline text-[1.6rem] font-bold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">Botanical Subscriptions</h3>
                      <p className="mt-4 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                        Subscription cycles are billed at the beginning of each period. Cancellations should be made before the
                        next renewal date.
                      </p>
                    </section>
        
                    <section className="rounded-[2rem] bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)] p-8 text-white shadow-[0_24px_60px_rgba(52,5,141,0.2)]">
                      <h3 className="font-headline text-[1.6rem] font-bold tracking-[-0.04em]">Premium Logistics</h3>
                      <p className="mt-4 text-base leading-8 text-white/82">
                        We aim to deliver quickly and carefully, but carrier delays or environmental disruptions can impact
                        timing beyond our control.
                      </p>
                    </section>
                  </div>
        
                  <section id="disclaimer" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
                    <h2 className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">2. Health & Wellness Disclaimer</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      <p>
                        Zoya Botanicals products are intended to support wellness routines and are not a substitute for medical
                        diagnosis, treatment, or professional care.
                      </p>
                      <p>
                        You should consult a qualified professional before starting any new supplement or skincare regimen if
                        you have underlying conditions or concerns.
                      </p>
                    </div>
                  </section>
        
                  <section id="liability" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
                    <h2 className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">3. Limitation of Liability</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      <p>
                        To the maximum extent permitted by law, Zoya Botanicals is not liable for indirect, incidental, or
                        consequential damages arising from use of the site or products.
                      </p>
                      <p>
                        Any direct claim is limited to the amount paid for the relevant order or service at issue.
                      </p>
                    </div>
                  </section>
                </article>
              </div>
              <Footer/>
              </>
    );
}
