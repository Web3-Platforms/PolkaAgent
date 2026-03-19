"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { AEGIS_VAULT_ABI, CONTRACT_ADDRESSES, SUPPORTED_TOKENS } from "@/lib/contracts";

type SupportedToken = (typeof SUPPORTED_TOKENS)[number];

export function WithdrawalForm() {
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<SupportedToken>(SUPPORTED_TOKENS[0]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [userBalance, setUserBalance] = useState("0");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: depositBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.AEGIS_VAULT as `0x${string}`,
    abi: AEGIS_VAULT_ABI,
    functionName: "getUserDeposit",
    args: address && selectedToken ? [address, selectedToken.address as `0x${string}`] : undefined,
    query: { enabled: !!address && !!selectedToken },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (depositBalance) {
      const balance = Number(depositBalance) / Math.pow(10, selectedToken.decimals);
      setUserBalance(balance.toFixed(6));
    }
  }, [depositBalance, selectedToken]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      setError("Please enter a valid amount");
      return;
    }

    if (Number(withdrawAmount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (Number(withdrawAmount) > Number(userBalance)) {
      setError("Insufficient balance");
      return;
    }

    try {
      const amount = parseUnits(withdrawAmount, selectedToken.decimals);

      writeContract({
        address: CONTRACT_ADDRESSES.AEGIS_VAULT as `0x${string}`,
        abi: AEGIS_VAULT_ABI,
        functionName: "withdraw",
        args: [selectedToken.address as `0x${string}`, amount],
      });

      setWithdrawAmount("");
      setSuccess("Withdrawal request submitted to your wallet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (!isConnected) {
    return (
      <div className="aegis-panel px-6 py-7 text-center">
        <p className="text-base text-[var(--aegis-ink-muted)]">Connect your wallet to access withdrawal actions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleWithdraw} className="aegis-panel space-y-5 px-6 py-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="aegis-metric-label">Outbound Flow</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Withdraw from the vault</h2>
        </div>
        <span className="aegis-chip">{selectedToken.symbol}</span>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--aegis-ink)]">Choose token</label>
        <select
          value={selectedToken.address}
          onChange={(e) => {
            const token = SUPPORTED_TOKENS.find((item) => item.address === e.target.value);
            if (token) setSelectedToken(token);
          }}
          className="aegis-select"
        >
          {SUPPORTED_TOKENS.map((token) => (
            <option key={token.address} value={token.address}>
              {token.icon} {token.symbol} - {token.name}
            </option>
          ))}
        </select>
      </div>

      <div className="aegis-panel-muted flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-medium text-[var(--aegis-ink)]">Available balance</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--aegis-brand-900)]">
            {userBalance} {selectedToken.symbol}
          </p>
        </div>
        <span className="aegis-badge aegis-badge-brand">Wallet-linked</span>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--aegis-ink)]">Amount ({selectedToken.symbol})</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            max={userBalance}
            className="aegis-input"
          />
          <button
            type="button"
            onClick={() => setWithdrawAmount(userBalance)}
            className="aegis-button aegis-button-secondary shrink-0"
          >
            Max
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[20px] border border-[rgba(230,84,111,0.24)] bg-[rgba(230,84,111,0.08)] px-4 py-3 text-sm text-[#8f1f35]">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[20px] border border-[rgba(49,196,122,0.24)] bg-[rgba(49,196,122,0.1)] px-4 py-3 text-sm text-[#14653d]">
          {success}
        </div>
      )}

      {isSuccess && (
        <div className="rounded-[20px] border border-[rgba(49,196,122,0.24)] bg-[rgba(49,196,122,0.1)] px-4 py-3 text-sm text-[#14653d]">
          Withdrawal successful.
        </div>
      )}

      <button
        type="submit"
        disabled={!withdrawAmount || isPending || isConfirming || Number(withdrawAmount) > Number(userBalance)}
        className="aegis-button aegis-button-primary w-full"
      >
        {isPending ? "Processing..." : isConfirming ? "Confirming..." : "Withdraw"}
      </button>

      {hash && (
        <div className="rounded-[20px] bg-[rgba(255,255,255,0.6)] px-4 py-3 text-xs text-[var(--aegis-ink-muted)]">
          <p className="font-semibold text-[var(--aegis-ink)]">Transaction Hash</p>
          <p className="mt-1 break-all font-mono">{hash}</p>
        </div>
      )}
    </form>
  );
}
