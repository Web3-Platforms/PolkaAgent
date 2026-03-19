import type { Metadata } from "next";
import { Web3Provider } from "@/components/Web3Provider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aegis Protocol",
  description:
    "Intent-based, AI-guarded cross-chain yield vault for Polkadot Hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="aegis-app">
          <div className="aegis-orb aegis-orb-primary" />
          <div className="aegis-orb aegis-orb-secondary" />
          <Web3Provider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </Web3Provider>
        </div>
      </body>
    </html>
  );
}
