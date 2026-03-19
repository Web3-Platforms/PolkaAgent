"use client";

import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="aegis-page">
      <div className="aegis-shell space-y-8">
        <section className="aegis-page-header grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="aegis-kicker">Intent Console</span>
            <h1 className="aegis-display aegis-page-title">Describe the move. Let Aegis score the route.</h1>
            <p className="aegis-page-subtitle">
              The chat surface keeps the same yield-intent flow, but now presents risk analysis inside a calmer, more precise decision environment.
            </p>
          </div>

          <div className="aegis-panel px-6 py-6">
            <p className="aegis-metric-label">How It Works</p>
            <ol className="mt-4 space-y-3 text-sm text-[var(--aegis-ink-muted)]">
              <li>1. Describe a strategy such as earning yield on Acala.</li>
              <li>2. Aegis evaluates risk before any routing step is offered.</li>
              <li>3. If the score is below the threshold, execution can proceed.</li>
              <li>4. Unsafe routes remain blocked by design.</li>
            </ol>
          </div>
        </section>

        <ChatInterface />

        <section className="grid gap-4 md:grid-cols-2">
          <article className="aegis-panel px-6 py-6">
            <p className="aegis-metric-label">Risk Gate</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">AI protection stays visible.</h2>
            <p className="aegis-copy mt-3">
              The updated UI makes safe versus blocked outcomes more legible without changing the routing logic behind them.
            </p>
          </article>

          <article className="aegis-panel px-6 py-6">
            <p className="aegis-metric-label">Operator Note</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--aegis-ink)]">Use chat for exploration, vault for execution.</h2>
            <p className="aegis-copy mt-3">
              This separation remains intact. The redesign just makes the transition between those surfaces feel intentional.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
