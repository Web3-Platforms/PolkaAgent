"use client";

import { useEffect, useState } from "react";
import { TransactionHistory } from "@/components/TransactionHistory";
import { YieldStatistics } from "@/components/YieldStatistics";
import { getTransactionStats } from "@/lib/mockData";

export default function ActivityPage() {
  const [txStats, setTxStats] = useState({
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalYieldRouted: 0,
    transactionCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const txData = await getTransactionStats();
        setTxStats(txData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Transactions", value: `${txStats.transactionCount}`, note: "Tracked interactions" },
    { label: "Total Deposited", value: `${txStats.totalDeposited.toFixed(2)}`, note: "Tokens moved into vault" },
    { label: "Total Withdrawn", value: `${txStats.totalWithdrawn.toFixed(2)}`, note: "Tokens returned to wallet" },
    { label: "Yield Routed", value: `${txStats.totalYieldRouted.toFixed(2)}`, note: "Tokens used in active strategies" },
  ];

  return (
    <div className="aegis-page">
      <div className="aegis-shell space-y-8">
        <section className="aegis-page-header">
          <span className="aegis-kicker">Performance Layer</span>
          <h1 className="aegis-display aegis-page-title">Protocol activity with stronger signal hierarchy.</h1>
          <p className="aegis-page-subtitle">
            Analytics now read like part of the same product system: clearer metric cards, stronger grouping, and consistent brand treatment across transaction and yield views.
          </p>
        </section>

        {!isLoading && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article key={card.label} className="aegis-panel px-5 py-5">
                <p className="aegis-metric-label">{card.label}</p>
                <p className="aegis-metric-value mt-4">{card.value}</p>
                <p className="mt-2 text-sm text-[var(--aegis-ink-muted)]">{card.note}</p>
              </article>
            ))}
          </section>
        )}

        <YieldStatistics />

        <TransactionHistory />

        <section className="grid gap-4 md:grid-cols-2">
          <article className="aegis-panel px-6 py-6">
            <p className="aegis-metric-label">Understanding Metrics</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--aegis-ink-muted)]">
              <li>Total yield reflects cumulative gains across active parachain strategies.</li>
              <li>Average APY captures mean performance across current routes.</li>
              <li>Risk score remains the AI-derived safety metric used for gating.</li>
            </ul>
          </article>

          <article className="aegis-panel px-6 py-6">
            <p className="aegis-metric-label">Optimization Notes</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--aegis-ink-muted)]">
              <li>Diversify across supported routes when seeking a broader return profile.</li>
              <li>Use the chat interface to evaluate new opportunities before routing.</li>
              <li>Rebalance through the vault surface when a strategy no longer fits.</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
