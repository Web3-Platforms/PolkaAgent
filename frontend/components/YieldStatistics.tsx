"use client";

import { useEffect, useState } from "react";
import { getYieldData, getYieldStats, type YieldData } from "@/lib/mockData";

export function YieldStatistics() {
  const [yields, setYields] = useState<YieldData[]>([]);
  const [stats, setStats] = useState({
    totalYield: 0,
    activeStrategies: 0,
    averageAPY: 0,
    averageRiskScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [yieldData, yieldStats] = await Promise.all([getYieldData(), getYieldStats()]);
        setYields(yieldData);
        setStats(yieldStats);
      } catch (error) {
        console.error("Failed to fetch yield data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="aegis-panel h-56 animate-pulse" />
        <div className="aegis-panel h-56 animate-pulse" />
      </div>
    );
  }

  const getRiskColor = (risk: number) => {
    if (risk < 30) return "text-[#1e9158]";
    if (risk < 60) return "text-[#a06f19]";
    return "text-[#a12d45]";
  };

  const getRiskLabel = (risk: number) => {
    if (risk < 30) return "Low";
    if (risk < 60) return "Medium";
    return "High";
  };

  const topApy = yields.length > 0 ? Math.max(...yields.map((item) => item.apy)).toFixed(2) : "0";
  const lowApy = yields.length > 0 ? Math.min(...yields.map((item) => item.apy)).toFixed(2) : "0";
  const totalRouted = yields.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
  const totalYield = yields.reduce((sum, item) => sum + item.yield, 0).toFixed(2);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="aegis-panel px-5 py-5">
          <p className="aegis-metric-label">Total Yield Earned</p>
          <p className="aegis-metric-value mt-4">{stats.totalYield.toFixed(2)} DOT</p>
          <p className="mt-2 text-sm text-[var(--aegis-ink-muted)]">All-time performance.</p>
        </article>
        <article className="aegis-panel px-5 py-5">
          <p className="aegis-metric-label">Active Strategies</p>
          <p className="aegis-metric-value mt-4">{stats.activeStrategies}</p>
          <p className="mt-2 text-sm text-[var(--aegis-ink-muted)]">Currently routing yield.</p>
        </article>
        <article className="aegis-panel px-5 py-5">
          <p className="aegis-metric-label">Average APY</p>
          <p className="aegis-metric-value mt-4">{stats.averageAPY.toFixed(2)}%</p>
          <p className="mt-2 text-sm text-[var(--aegis-ink-muted)]">Across active routes.</p>
        </article>
        <article className="aegis-panel px-5 py-5">
          <p className="aegis-metric-label">Average Risk</p>
          <p className={`aegis-metric-value mt-4 ${getRiskColor(stats.averageRiskScore)}`}>
            {stats.averageRiskScore.toFixed(1)}/100
          </p>
          <p className="mt-2 text-sm text-[var(--aegis-ink-muted)]">{getRiskLabel(stats.averageRiskScore)} risk profile.</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="aegis-panel px-6 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="aegis-metric-label">Strategy Breakdown</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Yield by parachain</h2>
            </div>
          </div>

          {yields.length === 0 ? (
            <div className="py-10 text-center text-[var(--aegis-ink-muted)]">No active yield strategies yet.</div>
          ) : (
            <div className="mt-6 space-y-4">
              {yields.map((item) => (
                <article key={item.parachainId} className="aegis-panel-muted p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,var(--aegis-brand-900),var(--aegis-brand-500))] font-bold text-white shadow-[0_10px_24px_rgba(177,20,103,0.22)]">
                        {item.parachainName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--aegis-ink)]">{item.parachainName}</p>
                        <p className="text-sm text-[var(--aegis-ink-muted)]">ID: {item.parachainId}</p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xl font-semibold text-[var(--aegis-brand-900)]">{item.amount.toFixed(2)} DOT</p>
                      <p className="text-sm text-[#1e9158]">+{item.yield.toFixed(2)} yield</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--aegis-ink-muted)]">APY</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--aegis-ink)]">{item.apy.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--aegis-ink-muted)]">Risk Score</p>
                      <p className={`mt-1 text-sm font-semibold ${getRiskColor(item.riskScore)}`}>
                        {item.riskScore}/100 · {getRiskLabel(item.riskScore)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-[var(--aegis-ink-muted)]">
                      <span>Risk distribution</span>
                      <span>{item.riskScore}%</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-[rgba(134,9,79,0.08)]">
                      <div
                        className={`h-2.5 rounded-full ${
                          item.riskScore < 30
                            ? "bg-[#27ab67]"
                            : item.riskScore < 60
                            ? "bg-[#d19a2f]"
                            : "bg-[#d34a67]"
                        }`}
                        style={{ width: `${item.riskScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--aegis-ink-muted)]">
                    <span className={`aegis-badge ${item.routed ? "aegis-badge-success" : "aegis-badge-brand"}`}>
                      {item.routed ? "Active" : "Inactive"}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="aegis-panel px-6 py-6">
          <p className="aegis-metric-label">Performance Snapshot</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Quick comparisons</h2>

          <div className="mt-6 grid gap-3">
            <div className="aegis-panel-muted p-4">
              <p className="text-sm text-[var(--aegis-ink-muted)]">Highest APY</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--aegis-brand-900)]">{topApy}%</p>
            </div>
            <div className="aegis-panel-muted p-4">
              <p className="text-sm text-[var(--aegis-ink-muted)]">Lowest APY</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--aegis-brand-900)]">{lowApy}%</p>
            </div>
            <div className="aegis-panel-muted p-4">
              <p className="text-sm text-[var(--aegis-ink-muted)]">Total Yield</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--aegis-brand-900)]">{totalYield}</p>
            </div>
            <div className="aegis-panel-muted p-4">
              <p className="text-sm text-[var(--aegis-ink-muted)]">Total Allocated</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--aegis-brand-900)]">{totalRouted}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
