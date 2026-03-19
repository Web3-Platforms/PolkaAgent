"use client";

import { useEffect, useRef, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  data?: {
    parachainId?: number;
    riskScore?: number;
    safeToRoute?: boolean;
  };
}

interface RiskOracleResponse {
  parachainId: number;
  riskScore: number;
  safeToRoute: boolean;
}

export function ChatInterface() {
  const { isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "Hello. I am Aegis, your AI-guarded yield assistant. Describe what you want to do with your DOT and I will assess the route before execution.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dismissedConfirmations, setDismissedConfirmations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callRiskOracle = async (intent: string): Promise<RiskOracleResponse> => {
    const response = await fetch("/api/risk-oracle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ intent }),
    });

    if (!response.ok) {
      throw new Error("Failed to get risk assessment");
    }

    return response.json();
  };

  const getParachainName = (parachainId: number): string => {
    const parachains: Record<number, string> = {
      1000: "Statemine",
      2000: "Acala",
      2001: "Astar",
      2004: "Moonbeam",
      2012: "Parallel",
      2085: "Heiko",
      2087: "Picasso",
      2092: "Bifrost",
      2101: "Composable Finance",
    };
    return parachains[parachainId] || `Parachain ${parachainId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const riskData = await callRiskOracle(userMessage.content);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Intent analyzed.\nRisk score: ${riskData.riskScore}/100\nParachain: ${getParachainName(riskData.parachainId)}\nStatus: ${riskData.safeToRoute ? "Safe to proceed" : "Too risky. Transaction blocked."}`,
        timestamp: new Date(),
        data: riskData,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (riskData.safeToRoute) {
        const transactionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "system",
          content: "This route passed the risk gate. Confirm if you want to execute the transaction.",
          timestamp: new Date(),
          data: riskData,
        };
        setMessages((prev) => [...prev, transactionMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I could not analyze that request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = (message: Message) => {
    if (!message.data || !isConnected) return;

    writeContract({
      address: "0x0000000000000000000000000000000000000000",
      abi: [],
      functionName: "mockTransaction",
      args: [],
      value: parseEther("0.01"),
    });
  };

  const handleCancelTransaction = (message: Message) => {
    setDismissedConfirmations((prev) => [...prev, message.id]);
    setMessages((prev) => [
      ...prev,
      {
        id: `${message.id}-cancelled`,
        type: "ai",
        content: "Transaction cancelled. No transaction was sent.",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isConnected) {
    return (
      <div className="aegis-panel px-6 py-10 text-center">
        <p className="aegis-metric-label">Wallet Required</p>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--aegis-ink)]">Connect before opening the intent channel.</h2>
        <p className="aegis-copy mt-3">
          Use the connect control in the navigation bar to start chatting with Aegis.
        </p>
      </div>
    );
  }

  return (
    <section className="aegis-panel overflow-hidden">
      <div className="aegis-panel-strong aegis-grid-card rounded-none px-6 py-6">
        <div className="relative z-10">
          <p className="aegis-metric-label !text-white/60">Assistant Channel</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Aegis chat assistant</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/74">
            Submit a yield intent and receive an AI risk decision before any routing step is offered.
          </p>
        </div>
      </div>

      <div className="aegis-scroll h-[28rem] space-y-4 overflow-y-auto bg-[rgba(255,251,253,0.72)] p-4 md:p-5">
        {messages.map((message) => {
          const isUser = message.type === "user";
          const isSystem = message.type === "system";

          return (
            <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] rounded-[24px] px-4 py-3 text-sm shadow-[0_14px_32px_rgba(93,14,59,0.08)] md:max-w-[75%] ${
                  isUser
                    ? "bg-[linear-gradient(135deg,var(--aegis-brand-900),var(--aegis-brand-500))] text-white"
                    : isSystem
                    ? "border border-[rgba(49,196,122,0.22)] bg-[rgba(49,196,122,0.1)] text-[var(--aegis-ink)]"
                    : "border border-[rgba(134,9,79,0.1)] bg-white text-[var(--aegis-ink)]"
                }`}
              >
                <div className="whitespace-pre-wrap leading-7">{message.content}</div>

                {message.data &&
                  message.type === "system" &&
                  !dismissedConfirmations.includes(message.id) && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => handleConfirmTransaction(message)}
                        disabled={isPending || isConfirming}
                        className="aegis-button aegis-button-primary w-full"
                        data-testid="confirm-transaction"
                      >
                        {isPending
                          ? "Confirming..."
                          : isConfirming
                          ? "Processing..."
                          : isSuccess
                          ? "Transaction Complete"
                          : "Confirm Transaction"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelTransaction(message)}
                        className="aegis-button aegis-button-secondary w-full"
                        data-testid="cancel-transaction"
                      >
                        Cancel
                      </button>
                    </div>
                )}

                <div className={`mt-2 text-xs ${isUser ? "text-white/75" : "text-[var(--aegis-ink-muted)]"}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-[24px] border border-[rgba(134,9,79,0.1)] bg-white px-4 py-3 shadow-[0_14px_32px_rgba(93,14,59,0.08)]">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[var(--aegis-brand-700)]" />
                <span className="text-sm text-[var(--aegis-ink-muted)]">Analyzing your request...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[rgba(134,9,79,0.1)] bg-white/60 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your DeFi intent. Example: Earn yield on Acala."
            className="aegis-input flex-1"
            disabled={isLoading}
            data-testid="chat-intent-input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="aegis-button aegis-button-primary md:min-w-[9rem]"
            data-testid="chat-send-button"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
