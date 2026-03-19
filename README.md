# Aegis Protocol

Aegis Protocol is an AI-guarded cross-chain yield vault built for the Paseo Testnet. The repository combines a Hardhat smart-contract package, a Next.js frontend, and an intent-risk layer that decides whether a cross-chain route is safe before any execution path is offered to the user.

## What This Repository Contains

- `contracts/`: Solidity contracts, Hardhat tests, coverage, gas profiling, and the Paseo deployment script.
- `frontend/`: Next.js app for vault actions, activity visibility, and AI-assisted intent routing.
- `frontend/app/api/risk-oracle/route.ts`: local risk-oracle endpoint used by the chat UI to classify routing intent.

## Core Capabilities

- AI-gated routing: intents are scored before a route can be confirmed.
- Vault operations: users can deposit and withdraw supported ERC20 assets.
- XCM-aware architecture: the vault exposes a `routeYieldViaXCM` path designed to hand off execution through the Polkadot XCM precompile.
- Browser-level verification: Playwright covers the cancel flow to ensure dismissing the intent modal does not send a transaction.

## Architecture

### Text-Based Diagram

```text
User + Wallet
   |
   | enter vault action or describe a routing intent
   v
Next.js Frontend (frontend/)
   |
   | chat intent
   v
AI Intent Layer
frontend/app/api/risk-oracle/route.ts
   |
   | returns { parachainId, riskScore, safeToRoute }
   v
Risk Gate in UI
   |
   | only if riskScore < 75
   v
wagmi + viem transaction client
   |
   | write contract call
   v
AegisVault.sol
Paseo Testnet / Polkadot Hub EVM endpoint
chainId 420420417
   |
   | routeYieldViaXCM(destParachainId, amount, aiRiskScore)
   v
Polkadot XCM precompile
0x0000000000000000000000000000000000000801
   |
   | send XCM message / execute cross-chain handoff
   v
Target parachain strategy
Acala / Astar / Moonbeam / Parallel / others
```

### How The Layers Work Together

1. A user connects a wallet and either interacts with the vault UI or submits a natural-language routing intent in chat.
2. The frontend sends the chat intent to the local AI intent layer at `frontend/app/api/risk-oracle/route.ts`.
3. The intent layer maps the destination parachain and returns a risk score.
4. If the score is below the `MAX_RISK_SCORE` threshold of `75`, the UI can present a confirmable execution step.
5. On-chain routing is exposed through `AegisVault.routeYieldViaXCM(...)`, which is restricted to the configured AI oracle address.
6. The contract is wired to the Polkadot XCM precompile address `0x0000000000000000000000000000000000000801`, which represents the handoff point into XCM execution.

## Stack

- Smart contracts: Solidity `0.8.20`, Hardhat, OpenZeppelin
- Frontend: Next.js `16`, React `19`, TypeScript `5`, Tailwind `4`
- Web3 client: wagmi, viem
- Test tooling: Hardhat, `solidity-coverage`, `hardhat-gas-reporter`, Playwright
- Network target: Paseo Testnet (`https://eth-rpc-testnet.polkadot.io`, chain ID `420420417`)

## Local Setup In Under 15 Minutes

### Prerequisites

- Node.js `20+`
- npm `10+`
- Git

### 1. Clone The Repository

```bash
git clone <repo-url>
cd PolkaAgent-1
```

### 2. Install Contract Dependencies

```bash
cd contracts
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
npx playwright install chromium
cd ..
```

### 4. Create Local Frontend Environment

```bash
cp frontend/.env.example frontend/.env.local
```

The default values are sufficient for local UI development. Replace them only if you have real Paseo deployment addresses.

### 5. Start The Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

### 6. Run Contract Tests In A Second Terminal

```bash
cd contracts
npm test
```

### 7. Run Frontend Verification

Production build:

```bash
cd frontend
npm run build
```

Playwright end-to-end suite:

```bash
cd frontend
npm run test:e2e
```

The current Playwright suite verifies the cancellation path in chat and checks that canceling a safe routing intent does not submit a wallet transaction.

## Quality Checks

### Contracts

```bash
cd contracts
npm test
npm run coverage
npm run gas
```

### Frontend

```bash
cd frontend
npm run build
npm run test:e2e
```

## Repository Layout

```text
PolkaAgent-1/
├── contracts/
│   ├── contracts/AegisVault.sol
│   ├── scripts/deploy.js
│   └── test/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/contracts.ts
│   ├── playwright.config.ts
│   └── tests/e2e/chat-cancel.spec.ts
└── README.md
```

## Paseo Testnet Contract Addresses

The repository is prepared for Paseo deployment, but this workspace does not currently include a committed `contracts/deployments/paseo.json` file or a non-placeholder frontend env file. That means no Aegis-owned deployed contract addresses are verifiable from source control at the moment.

| Contract / Dependency | Address | Status |
| --- | --- | --- |
| AegisVault | Not present in workspace | Expected to be written to `contracts/deployments/paseo.json` by `cd contracts && npm run deploy` |
| DOT token | Not present in workspace | Populate `NEXT_PUBLIC_DOT_TOKEN_ADDRESS` after deployment or token selection |
| USDT token | Not present in workspace | Populate `NEXT_PUBLIC_USDT_TOKEN_ADDRESS` |
| USDC token | Not present in workspace | Populate `NEXT_PUBLIC_USDC_TOKEN_ADDRESS` |
| Polkadot XCM precompile | `0x0000000000000000000000000000000000000801` | Hard-coded in `contracts/contracts/AegisVault.sol` |

Frontend env keys used for Paseo wiring:

```bash
NEXT_PUBLIC_AEGIS_VAULT_ADDRESS=0x...
NEXT_PUBLIC_DOT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_USDT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_USDC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_PASEO_RPC_URL=https://eth-rpc-testnet.polkadot.io
```

## Deployment Notes

- Contract deployment command: `cd contracts && npm run deploy`
- Frontend production build command: `cd frontend && npm run build`
- Vercel runtime config lives in `frontend/vercel.json`

Once a real Paseo deployment is executed, commit `contracts/deployments/paseo.json` or publish the addresses through frontend environment variables so the deployment section above can be converted from placeholders into concrete production references.
