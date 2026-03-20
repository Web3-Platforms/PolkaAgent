"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { BrandMark } from "@/components/BrandMark";

const features = [
  {
    title: "AI-Gated Yield Routing",
    description: "Aegis scores every intent before capital moves, so unsafe routes are blocked before execution.",
    tone: "Secure by design",
    icon: "🛡️",
  },
  {
    title: "Vault Operations",
    description: "Deposit and withdraw supported assets through the same guided interface used across the protocol.",
    tone: "Operational clarity",
    icon: "💼",
  },
  {
    title: "Cross-Chain Execution",
    description: "Yield is routed across Polkadot-connected environments without changing your core vault workflow.",
    tone: "Network-native flow",
    icon: "🔗",
  },
];

const quickLinks = [
  { href: "/vault", label: "Open Vault", detail: "Manage deposits, withdrawals, and balances." },
  { href: "/activity", label: "View Activity", detail: "Inspect routing, transactions, and yield metrics." },
  { href: "/chat", label: "Launch Chat", detail: "Describe an intent and let Aegis evaluate it." },
];

export default function Home() {
  const { isConnected, address } = useAccount();

  return (
    <div className="aegis-page">
      <div className="aegis-shell space-y-12">
        {/* Hero Section */}
        <section className="grid gap-8 xl:grid-cols-[1.45fr_0.95fr] animate-fade-in">
          <div className="aegis-panel relative overflow-hidden px-7 py-8 md:px-10 md:py-10">
            <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(219,77,146,0.17),transparent_70%)] lg:block" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="aegis-kicker animate-slide-in-right">Brand System Derived From Logo</span>
              <div className="flex items-start gap-5">
                <BrandMark className="hidden h-24 w-24 shrink-0 md:block animate-float" />
                <div className="space-y-4">
                  <h1 className="aegis-display aegis-page-title">
                    Shielded yield orchestration for the Polkadot stack.
                  </h1>
                  <p className="aegis-page-subtitle">
                    The interface is now centered on the Aegis identity: ivory surfaces, berry accents, geometric shield lines, and a calmer premium layout that does not change how the product works.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="aegis-chip animate-scale-in">Intent-based routing</span>
                <span className="aegis-chip" style={{ animationDelay: "0.1s" }}>AI risk gating</span>
                <span className="aegis-chip" style={{ animationDelay: "0.2s" }}>Paseo Testnet</span>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Link href="/vault" className="aegis-button aegis-button-primary transition-all hover:scale-105">
                  Enter Vault
                </Link>
                <Link href="/activity" className="aegis-button aegis-button-secondary transition-all hover:scale-105">
                  Review Analytics
                </Link>
              </div>
            </div>
          </div>

          <aside className="aegis-panel-strong aegis-grid-card rounded-[30px] px-7 py-8 md:px-8 md:py-9 animate-slide-in-right">
            <div className="relative z-10 space-y-6">
              <span className="aegis-kicker border-white/10 bg-white/10 text-white before:shadow-[0_0_20px_rgba(255,170,212,0.5)]">
                Live Wallet State
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Connection</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className={`inline-block h-3 w-3 rounded-full transition-all ${isConnected ? "bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" : "bg-amber-400"}`} />
                  <p className="text-2xl font-semibold text-white">
                    {isConnected ? "Wallet connected" : "Waiting for wallet"}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm transition-all hover:bg-white/15">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Address</p>
                <p className="mt-2 break-all font-mono text-sm text-white/92">
                  {address ?? "0x401Bc0eb5c6c7A9bb95825e87F0cCA4090596121"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">Risk Gate</p>
                  <p className="mt-2 text-3xl font-bold text-white">75</p>
                  <p className="mt-1 text-sm text-white/70">Maximum score</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">Status</p>
                  <p className="mt-2 text-3xl font-bold text-white">Aegis</p>
                  <p className="mt-1 text-sm text-white/70">Enhanced Security</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Features Section */}
        <section className="space-y-4 animate-fade-in-up">
          <div>
            <h2 className="text-3xl font-bold text-[var(--aegis-ink)]">Core Features</h2>
            <p className="mt-2 text-[var(--aegis-ink-muted)]">Powerful capabilities built into your vault experience</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <article 
                key={feature.title} 
                className="feature-card"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <p className="aegis-metric-label">{feature.tone}</p>
                <h3 className="mt-4">{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-card-tone"></div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="aegis-panel px-6 py-8 md:px-10 md:py-10 animate-fade-in">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3 max-w-2xl">
              <span className="aegis-kicker">Protocol Access</span>
              <h2 className="text-3xl font-semibold text-[var(--aegis-ink)]">Choose your operating surface</h2>
              <p className="aegis-page-subtitle text-base">
                Every area keeps the same feature set. The redesign only improves hierarchy, readability, and visual cohesion with the Aegis identity.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {quickLinks.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                className="group cta-link justify-between border-[var(--aegis-border)] rounded-[24px] flex-col items-start"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-full">
                  <p className="aegis-metric-label">{item.label}</p>
                  <h3 className="text-lg font-semibold text-[var(--aegis-ink)] mt-3">{item.label}</h3>
                </div>
                <p className="aegis-copy text-sm mt-3 w-full">{item.detail}</p>
                <div className="mt-4 text-xl text-[var(--aegis-brand-900)] transition-transform group-hover:translate-x-1">
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
