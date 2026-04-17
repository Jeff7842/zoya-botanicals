'use client'
import AccountTitleBadge from "@/components/account/title-badge";
import  Header from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

export default function PrivacyPage() {
    
    return (
      <>
      <Header/>
        <div className="mx-auto pt-16 flex max-w-7xl flex-col gap-12 lg:flex-row">
                <aside className="w-full lg:sticky lg:top-28 lg:w-72 lg:self-start">
                  <div className="rounded-[1.75rem] border border-[#ebe7f2] bg-white p-6 dark:border-white/10 dark:bg-[#120d21]">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7]">On this page</p>
                    <nav className="mt-6 space-y-3 text-sm text-[#6f6a7d] dark:text-[#b6abcf]">
                      <a href="#collection" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Data Collection</a>
                      <a href="#usage" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Information Usage</a>
                      <a href="#protection" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Protection Protocol</a>
                      <a href="#rights" className="block transition-colors hover:text-[#34058d] dark:hover:text-[#d7c4ff]">Your Rights</a>
                    </nav>
                  </div>
                </aside>
        
                <article className="min-w-0 flex-1 space-y-10">
                  <header className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#faf8ff_0%,#f0eef5_100%)] p-8 dark:bg-[linear-gradient(135deg,#171126_0%,#0f091c_100%)] md:p-12">
                    <AccountTitleBadge icon="solar:lock-keyhole-linear" label="Security & Trust" />
                    <h1 className="mt-6 font-headline text-[3.4rem] font-black leading-none tracking-[-0.06em] text-[#34058d] dark:text-[#f4eeff] md:text-[5.4rem]">
                      Privacy<br />Policy.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      Zoya Botanicals handles your account data with the same care we apply to every curated wellness ritual.
                    </p>
                  </header>
        
                  <section id="collection" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
                    <h2 className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">1. Data Collection</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      <p>
                        We collect the information you provide directly when creating an account or updating your profile,
                        including your name, email, phone number, country, city, and username.
                      </p>
                      <p>
                        We also retain technical data necessary to secure the platform, such as IP-based session information and
                        sign-in activity.
                      </p>
                    </div>
                  </section>
        
                  <section id="usage" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
                    <h2 className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">2. Information Usage</h2>
                    <ul className="mt-5 space-y-4 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      <li>We use your data to operate your account, verify your identity, and deliver support when requested.</li>
                      <li>We use limited session and security data to prevent unauthorized access and account misuse.</li>
                      <li>We do not expose extra private table fields inside the dashboard beyond the editable account fields.</li>
                    </ul>
                  </section>
        
                  <section id="protection" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
                    <h2 className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">3. Protection Protocol</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      <p>
                        Access to account updates is verified server-side. Password changes require the current password, and
                        username changes follow a strict cooldown and maximum-change policy.
                      </p>
                      <p>
                        We minimize the data surfaced in the account UI and keep sensitive operations on the server.
                      </p>
                    </div>
                  </section>
        
                  <section id="rights" className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
                    <h2 className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-[#34058d] dark:text-[#f4eeff]">4. Your Rights</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
                      <p>You may update the editable account fields available in your dashboard whenever platform rules allow.</p>
                      <p>
                        You may contact support if you need help understanding how your account information is stored or
                        maintained.
                      </p>
                    </div>
                  </section>
                </article>
              </div>
              <Footer/>
              </>
    );
}
