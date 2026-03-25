'use client'

import "@/components/css/main.css";
import { Icon } from "@iconify/react";


const socialLinks = [
{icon: <Icon icon="mdi:earth" width="20" height="20" />, href: "https://zoyabotanicals.co.ke"},
{icon: <Icon icon="material-symbols:share-outline" width="20" height="20" />, href: "mailto:hello@zoyabotanicals.co.ke"},
{icon: <Icon icon="mdi:email-outline" width="20" height="20" />, href: "tel:+254700000000"},
]


export default function namePage() {
    return (
        <div>
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
