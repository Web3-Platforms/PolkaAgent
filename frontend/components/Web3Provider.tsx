"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, mock } from "wagmi/connectors";

const paseoRpcUrl =
  process.env.NEXT_PUBLIC_PASEO_RPC_URL ??
  "https://eth-rpc-testnet.polkadot.io";

// Paseo testnet configuration
const paseoTestnet = {
  id: 420420417,
  name: "Paseo Testnet",
  network: "paseo-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Paseo",
    symbol: "PAS",
  },
  rpcUrls: {
    default: { http: [paseoRpcUrl] },
    public: { http: [paseoRpcUrl] },
  },
} as const;

const isE2EMockWallet =
  process.env.NEXT_PUBLIC_E2E_MOCK_WALLET === "true" ||
  (typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("e2eMockWallet") === "1");

const connectors = isE2EMockWallet
  ? [
      mock({
        accounts: [
          "0x1234567890AbcdEF1234567890aBcdef12345678",
        ] as const,
        features: {
          defaultConnected: true,
          reconnect: true,
        },
      }),
    ]
  : [injected()];

const config = createConfig({
  chains: [paseoTestnet as any],
  connectors,
  transports: {
    [paseoTestnet.id]: http(paseoRpcUrl),
  },
});

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
