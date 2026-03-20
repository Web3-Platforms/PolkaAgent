"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { BrandMark } from "@/components/BrandMark";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/vault", label: "Vault" },
  { href: "/activity", label: "Activity" },
  { href: "/chat", label: "Chat" },
];

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <header className="aegis-nav">
      <div className="aegis-shell">
        <nav className="aegis-nav-shell animate-fade-in">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
            <BrandMark className="h-12 w-12 shrink-0 transition-transform" />
            <div>
              <p className="aegis-display text-[1.55rem] leading-none text-[var(--aegis-brand-900)]">
                AEGIS
              </p>
              <p className="text-xs uppercase tracking-[0.34em] text-[var(--aegis-ink-muted)]">
                Protocol
              </p>
            </div>
          </Link>

          <div className="aegis-nav-links">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`aegis-nav-link ${isActive ? "aegis-nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <a href="/vault#docs" className="aegis-nav-link">
              Docs
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-[rgba(134,9,79,0.12)] bg-white/70 px-3 py-2 text-sm text-[var(--aegis-ink-muted)]">
              <span className="aegis-status-dot aegis-status-live" />
              Paseo Testnet
            </div>

            {isConnected && address ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  className="aegis-button aegis-button-primary min-w-[10rem]"
                >
                  {truncateAddress(address)}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[22px] border border-[rgba(134,9,79,0.14)] bg-white/95 shadow-[0_28px_60px_rgba(93,14,59,0.16)] backdrop-blur">
                    <div className="space-y-2 border-b border-[rgba(134,9,79,0.1)] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aegis-ink-muted)]">
                        Connected Wallet
                      </p>
                      <p className="break-all font-mono text-sm text-[var(--aegis-ink)]">
                        {address}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-[#9b1d3d] transition-colors duration-200 hover:bg-[rgba(155,29,61,0.08)]"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleConnect} className="aegis-button aegis-button-primary">
                Connect Wallet
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
