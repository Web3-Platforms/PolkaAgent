"use client";

import { useEffect, useState } from "react";
import { getTransactions, type Transaction } from "@/lib/mockData";

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal" | "yield_routed">("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions =
    filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "yield_routed":
        return "Yield Routed";
      default:
        return "Transaction";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "aegis-badge aegis-badge-success";
      case "pending":
        return "aegis-badge aegis-badge-warning";
      case "failed":
        return "aegis-badge aegis-badge-danger";
      default:
        return "aegis-badge aegis-badge-brand";
    }
  };

  const truncateTxHash = (hash: string) => (hash.length > 12 ? `${hash.slice(0, 10)}...` : hash);

  if (isLoading) {
    return (
      <div className="aegis-panel px-6 py-6">
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--aegis-brand-700)]" />
        </div>
      </div>
    );
  }

  return (
    <section className="aegis-panel px-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="aegis-metric-label">Ledger</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Transaction history</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "deposit", "withdrawal", "yield_routed"].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`aegis-button px-4 py-2 text-sm ${
                filter === value ? "aegis-button-primary" : "aegis-button-secondary"
              }`}
            >
              {value === "all" ? "All" : value === "yield_routed" ? "Yields" : value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="py-10 text-center text-[var(--aegis-ink-muted)]">No transactions found.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredTransactions.map((tx) => (
            <article key={tx.id} className="aegis-panel-muted p-4 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-[var(--aegis-ink)]">{getTypeLabel(tx.type)}</p>
                    <span className={getStatusClass(tx.status)}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--aegis-ink-muted)]">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-xl font-semibold text-[var(--aegis-brand-900)]">
                    {tx.amount.toFixed(2)} {tx.token}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--aegis-ink-muted)]">{truncateTxHash(tx.txHash)}</p>
                </div>
              </div>

              {tx.type === "yield_routed" && tx.parachainId && (
                <>
                  <div className="aegis-divider mt-4" />
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--aegis-ink-muted)]">Parachain</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--aegis-ink)]">ID: {tx.parachainId}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--aegis-ink-muted)]">Risk Score</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--aegis-ink)]">{tx.riskScore}/100</p>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="mt-5 text-center text-xs text-[var(--aegis-ink-muted)]">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>
    </section>
  );
}
