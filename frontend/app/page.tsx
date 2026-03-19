"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { BrandMark } from "@/components/BrandMark";

const features = [
  {
    title: "AI-Gated Yield Routing",
    description: "Aegis scores every intent before capital moves, so unsafe routes are blocked before execution.",
    tone: "Secure by design",
  },
  {
    title: "Vault Operations",
    description: "Deposit and withdraw supported assets through the same guided interface used across the protocol.",
    tone: "Operational clarity",
  },
  {
    title: "Cross-Chain Execution",
    description: "Yield is routed across Polkadot-connected environments without changing your core vault workflow.",
    tone: "Network-native flow",
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
      <div className="aegis-shell space-y-8">
        <section className="grid gap-8 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="aegis-panel relative overflow-hidden px-7 py-8 md:px-10 md:py-10">
            <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(219,77,146,0.17),transparent_70%)] lg:block" />
            <div className="relative z-10 max-w-3xl">
              <span className="aegis-kicker">Brand System Derived From Logo</span>
              <div className="mt-8 flex items-start gap-5">
                <BrandMark className="hidden h-24 w-24 shrink-0 md:block" />
                <div>
                  <h1 className="aegis-display aegis-page-title">
                    Shielded yield orchestration for the Polkadot stack.
                  </h1>
                  <p className="aegis-page-subtitle">
                    The interface is now centered on the Aegis identity: ivory surfaces, berry accents, geometric shield lines, and a calmer premium layout that does not change how the product works.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="aegis-chip">Intent-based routing</span>
                <span className="aegis-chip">AI risk gating</span>
                <span className="aegis-chip">Paseo Testnet</span>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/vault" className="aegis-button aegis-button-primary">
                  Enter Vault
                </Link>
                <Link href="/activity" className="aegis-button aegis-button-secondary">
                  Review Analytics
                </Link>
              </div>
            </div>
          </div>

          <aside className="aegis-panel-strong aegis-grid-card rounded-[30px] px-7 py-8 md:px-8 md:py-9">
            <div className="relative z-10">
              <span className="aegis-kicker border-white/10 bg-white/10 text-white before:shadow-[0_0_20px_rgba(255,170,212,0.5)]">
                Live Wallet State
              </span>
              <div className="mt-8">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Connection</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className={`aegis-status-dot ${isConnected ? "aegis-status-live" : "aegis-status-idle"}`} />
                  <p className="text-2xl font-semibold text-white">
                    {isConnected ? "Wallet connected" : "Waiting for wallet"}
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-[24px] border border-white/12 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Address</p>
                <p className="mt-2 break-all font-mono text-sm text-white/92">
                  {address ?? "Connect from the top navigation to unlock vault actions and AI-assisted routing."}
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">Risk Gate</p>
                  <p className="mt-2 text-3xl font-bold text-white">75</p>
                  <p className="mt-1 text-sm text-white/70">Maximum AI score before routing is blocked.</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">Design Language</p>
                  <p className="mt-2 text-3xl font-bold text-white">Aegis</p>
                  <p className="mt-1 text-sm text-white/70">Shield geometry, soft glow, precise surfaces.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="aegis-panel px-6 py-6">
              <p className="aegis-metric-label">{feature.tone}</p>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--aegis-ink)]">{feature.title}</h2>
              <p className="aegis-copy mt-3">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="aegis-panel px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="aegis-kicker">Protocol Access</span>
              <h2 className="mt-5 text-3xl font-semibold text-[var(--aegis-ink)]">Choose your operating surface</h2>
              <p className="aegis-copy mt-3 max-w-2xl">
                Every area keeps the same feature set. The redesign only improves hierarchy, readability, and visual cohesion with the Aegis identity.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[26px] border border-[rgba(134,9,79,0.12)] bg-white/80 p-5 shadow-[0_14px_34px_rgba(93,14,59,0.08)] transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="aegis-metric-label">Workspace</p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-[var(--aegis-ink)]">{item.label}</h3>
                  <span className="text-xl text-[var(--aegis-brand-900)] transition-transform duration-200 group-hover:translate-x-1">
                    ↗
                  </span>
                </div>
                <p className="aegis-copy mt-3 text-sm">{item.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
