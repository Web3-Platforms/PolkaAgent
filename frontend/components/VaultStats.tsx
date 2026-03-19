"use client";

import { useAccount, useReadContract } from "wagmi";
import { AEGIS_VAULT_ABI, CONTRACT_ADDRESSES, SUPPORTED_TOKENS } from "@/lib/contracts";

export function VaultStats() {
  const { address, isConnected } = useAccount();

  const vaultStats = SUPPORTED_TOKENS.map((token) => {
    const { data: totalDeposits } = useReadContract({
      address: CONTRACT_ADDRESSES.AEGIS_VAULT as `0x${string}`,
      abi: AEGIS_VAULT_ABI,
      functionName: "totalDeposits",
      args: [token.address as `0x${string}`],
    });

    const { data: userDeposit } = useReadContract({
      address: CONTRACT_ADDRESSES.AEGIS_VAULT as `0x${string}`,
      abi: AEGIS_VAULT_ABI,
      functionName: "getUserDeposit",
      args: address ? [address, token.address as `0x${string}`] : undefined,
      query: { enabled: !!address },
    });

    const normalizedTotal = totalDeposits ? Number(totalDeposits) / Math.pow(10, token.decimals) : 0;
    const normalizedUser = userDeposit ? Number(userDeposit) / Math.pow(10, token.decimals) : 0;

    return {
      token,
      totalDeposits: normalizedTotal,
      userDeposit: normalizedUser,
      userShare: normalizedTotal > 0 ? (normalizedUser / normalizedTotal) * 100 : 0,
    };
  });

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <article className="aegis-panel px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="aegis-metric-label">Wallet Positioning</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Your deposits</h2>
          </div>
          <span className={`aegis-badge ${isConnected ? "aegis-badge-success" : "aegis-badge-brand"}`}>
            {isConnected ? "Connected" : "Wallet offline"}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {vaultStats.map((stat) => (
            <div key={stat.token.address} className="aegis-panel-muted flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-base font-semibold text-[var(--aegis-ink)]">
                  {stat.token.icon} {stat.token.symbol}
                </p>
                <p className="mt-1 text-sm text-[var(--aegis-ink-muted)]">
                  Vault share: {stat.userShare.toFixed(2)}%
                </p>
              </div>
              <p className="text-xl font-semibold text-[var(--aegis-brand-900)]">{stat.userDeposit.toFixed(6)}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="aegis-panel px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="aegis-metric-label">Protocol Inventory</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Total vault deposits</h2>
          </div>
          <span className="aegis-badge aegis-badge-brand">Live on-chain reads</span>
        </div>

        <div className="mt-6 space-y-3">
          {vaultStats.map((stat) => (
            <div key={stat.token.address} className="aegis-panel-muted p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-[var(--aegis-ink)]">
                    {stat.token.icon} {stat.token.symbol}
                  </p>
                  {isConnected && stat.userDeposit > 0 ? (
                    <p className="mt-1 text-sm text-[var(--aegis-ink-muted)]">Your share: {stat.userShare.toFixed(2)}%</p>
                  ) : (
                    <p className="mt-1 text-sm text-[var(--aegis-ink-muted)]">Protocol-wide balance</p>
                  )}
                </div>
                <p className="text-xl font-semibold text-[var(--aegis-brand-900)]">{stat.totalDeposits.toFixed(6)}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
