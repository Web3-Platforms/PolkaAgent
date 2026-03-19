"use client";

import Link from "next/link";
import { DepositForm } from "@/components/DepositForm";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import { VaultStats } from "@/components/VaultStats";
import { TransactionHistory } from "@/components/TransactionHistory";

const guides = [
  {
    title: "Deposit Flow",
    steps: [
      "Choose a supported token.",
      "Enter the amount to move into the vault.",
      "Approve and submit the wallet transaction.",
      "Track the position in the live history panel.",
    ],
  },
  {
    title: "Withdrawal Flow",
    steps: [
      "Select the asset you want back.",
      "Enter a value or use max balance.",
      "Confirm the withdrawal request in your wallet.",
      "Watch the vault balance refresh after settlement.",
    ],
  },
  {
    title: "Supported Assets",
    steps: [
      "DOT with 18 decimals.",
      "USDT with 6 decimals.",
      "USDC with 6 decimals.",
      "All assets share the same core vault workflow.",
    ],
  },
  {
    title: "Operational Notes",
    steps: [
      "Token approval is required before deposit execution.",
      "Verify network fees before confirming.",
      "Balances update after confirmation.",
      "Minimum deposit amount remains 0.01 tokens.",
    ],
  },
];

export default function VaultPage() {
  return (
    <div className="aegis-page">
      <div className="aegis-shell space-y-8">
        <section className="aegis-page-header grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="aegis-kicker">Vault Console</span>
            <h1 className="aegis-display aegis-page-title">Capital management wrapped in the Aegis shield.</h1>
            <p className="aegis-page-subtitle">
              Deposits, withdrawals, and on-chain position tracking now sit inside a cleaner premium shell built from the logo’s geometry and palette.
            </p>
          </div>

          <div className="aegis-panel px-6 py-6">
            <p className="aegis-metric-label">Design Intent</p>
            <p className="mt-4 text-2xl font-semibold text-[var(--aegis-ink)]">
              Preserve the vault workflow and sharpen the operational UX.
            </p>
            <p className="aegis-copy mt-3">
              No feature or route changes. Only hierarchy, visual trust signals, spacing, and component consistency were upgraded.
            </p>
          </div>
        </section>

        <VaultStats />

        <section className="grid gap-6 xl:grid-cols-2">
          <DepositForm />
          <WithdrawalForm />
        </section>

        <TransactionHistory />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {guides.map((guide) => (
            <article key={guide.title} className="aegis-panel px-5 py-5">
              <h2 className="text-xl font-semibold text-[var(--aegis-ink)]">{guide.title}</h2>
              <ol className="mt-4 space-y-3 text-sm text-[var(--aegis-ink-muted)]">
                {guide.steps.map((step, index) => (
                  <li key={`${guide.title}-${step}`} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(219,77,146,0.12)] text-xs font-bold text-[var(--aegis-brand-900)]">
                      {index + 1}
                    </span>
                    <span className="leading-6">{step}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>

        <section id="docs" className="aegis-panel-strong aegis-grid-card rounded-[30px] px-6 py-7 md:px-8">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="aegis-metric-label !text-white/60">Guidance</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Need protocol context while moving funds?</h2>
              <p className="mt-3 max-w-2xl text-white/78">
                Keep the vault workflow here, or switch to the chat surface for AI-assisted routing context without leaving the Aegis experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/chat" className="aegis-button aegis-button-tertiary">
                Open Chat
              </Link>
              <Link href="/" className="aegis-button aegis-button-secondary">
                Protocol Overview
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
