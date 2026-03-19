"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { AEGIS_VAULT_ABI, CONTRACT_ADDRESSES, SUPPORTED_TOKENS } from "@/lib/contracts";

type SupportedToken = (typeof SUPPORTED_TOKENS)[number];

export function DepositForm() {
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<SupportedToken>(SUPPORTED_TOKENS[0]);
  const [depositAmount, setDepositAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!depositAmount || isNaN(Number(depositAmount))) {
      setError("Please enter a valid amount");
      return;
    }

    if (Number(depositAmount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      setIsApproving(true);
      const amount = parseUnits(depositAmount, selectedToken.decimals);

      writeContract({
        address: CONTRACT_ADDRESSES.AEGIS_VAULT as `0x${string}`,
        abi: AEGIS_VAULT_ABI,
        functionName: "deposit",
        args: [selectedToken.address as `0x${string}`, amount],
      });

      setDepositAmount("");
      setSuccess("Deposit request submitted to your wallet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsApproving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="aegis-panel px-6 py-7 text-center">
        <p className="text-base text-[var(--aegis-ink-muted)]">Connect your wallet to access deposit actions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleDeposit} className="aegis-panel space-y-5 px-6 py-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="aegis-metric-label">Inbound Flow</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Deposit into the vault</h2>
        </div>
        <span className="aegis-chip">{selectedToken.symbol}</span>
      </div>

      <div className="aegis-panel-muted p-4">
        <p className="text-sm font-medium text-[var(--aegis-ink)]">Selected asset</p>
        <p className="mt-2 text-lg font-semibold text-[var(--aegis-brand-900)]">
          {selectedToken.icon} {selectedToken.name}
        </p>
        <p className="mt-1 text-sm text-[var(--aegis-ink-muted)]">Decimals: {selectedToken.decimals}</p>
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

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--aegis-ink)]">Amount ({selectedToken.symbol})</label>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="aegis-input"
        />
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
          Deposit successful.
        </div>
      )}

      <button
        type="submit"
        disabled={!depositAmount || isPending || isConfirming || isApproving}
        className="aegis-button aegis-button-primary w-full"
      >
        {isApproving || isPending ? "Approving..." : isConfirming ? "Confirming..." : "Deposit"}
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
