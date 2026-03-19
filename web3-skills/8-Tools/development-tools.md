# Web3 Development Tools & Infrastructure

## Essential Development Tools

### 1. Local Blockchain Environments

#### Hardhat Local Node

```bash
# Start local blockchain
npx hardhat node

# Runs on localhost:8545
# Pre-funded test accounts available
# Can fork mainnet state
```

**Features:**
- In-memory blockchain
- Auto-mining for faster testing
- State persistence possible
- Perfect for development

#### Anvil (Foundry)

```bash
# Start Anvil node
anvil

# Alternative to Hardhat node
# Written in Rust (faster)
# Better performance for complex tests
```

#### Ganache (Truffle)

```bash
# Using ganache-cli
ganache-cli --deterministic --accounts 10

# GUI version available
# More beginner-friendly
```

### 2. Development Frameworks

| Tool | Use Case | Pros | Cons |
|------|----------|------|------|
| **Hardhat** | Solidity dev + testing | Great docs, plugins | Slower |
| **Foundry** | High-performance testing | Fast, Solidity native | Steep learning curve |
| **Truffle** | Full dev environment | All-in-one | Heavyweight |
| **Brownie** | Python developers | Pythonic, powerful | Python-only |

### 3. Code Analysis Tools

#### Static Analysis - Slither

```bash
# Install
pip3 install slither-analyzer

# Run analysis
slither Vault.sol

# Output includes:
# - Reentrancy vulnerabilities
# - State change issues
# - Gas optimization tips
```

#### Mythril

```bash
# Install
pip3 install mythril

# Analyze contract
myth analyze Vault.sol
```

#### Certora Formal Verification

```bash
# Formal verification
# Proves mathematical correctness
# More thorough than static analysis
certora verify Vault.sol
```

### 4. Contract Auditing

#### OpenZeppelin Audit Service
```bash
# Professional security audit
# $5k-$50k depending on size
# Recommended for production contracts
openzepp.io/audits
```

#### SourceHawk
```bash
# Smaller audits
# Community reviews
# Good for mid-size projects
sourcehawk.io
```

## Blockchain APIs & Services

### 1. RPC Providers

```javascript
// Infura
const provider = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_KEY}`
);

// Alchemy
const provider = new ethers.providers.AlchemyProvider(
  "mainnet",
  ALCHEMY_KEY
);

// QuickNode
const provider = new ethers.providers.JsonRpcProvider(
  `https://quick.quicknode.io/${QUICKNODE_KEY}`
);

// Public RPC (free but slower)
const provider = new ethers.providers.JsonRpcProvider(
  "https://eth.public-rpc.com"
);
```

### 2. Block Explorers

#### Etherscan Integration

```javascript
// Verify contract on Etherscan
const verification = {
  address: deployedAddress,
  constructorArguments: constructorArgs,
  contract: "contracts/Vault.sol:Vault"
};

// Using Hardhat plugin
// npx hardhat verify [address] [args...]
```

#### Polkadot Subscan

```bash
# Used for Polkadot/Substrate blockchains
# View pallets, extrinsics, events
# URL: https://polkadot.subscan.io/
```

### 3. Data Indexing Services

#### The Graph

```graphql
# Schema for indexing smart contract events
type Deposit @entity {
  id: ID!
  user: String!
  amount: BigInt!
  timestamp: Int!
  transactionHash: String!
}

# Query
query {
  deposits(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    user
    amount
    timestamp
  }
}
```

#### Alchemy SDK

```javascript
import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  apiKey: ALCHEMY_KEY,
  network: Network.ETH_MAINNET
});

// Get contract events
const events = await alchemy.core.getLogs({
  address: vaultAddress,
  fromBlock: 'latest',
  toBlock: 'latest'
});
```

## Security & Monitoring

### 1. Transaction Monitoring

```javascript
// OpenZeppelin Defender
import { DefenderRelayer } from 'defender-relay-client';

const relayer = new DefenderRelayer(credentials);

const tx = await relayer.sendTransaction({
  to: targetAddress,
  data: encodedData,
  gasLimit: 1000000
});
```

### 2. Gas Estimation

```bash
# Hardhat plugin for gas tracking
npm install hardhat-gas-reporter

# Generates report of gas usage
REPORT_GAS=true npx hardhat test
```

### 3. Multisig Wallets

#### Gnosis Safe

```javascript
// Optimal for controlling vault
// Requires M-of-N signatures
// Time locks available
// Governance integration possible

import { SafeFactory } from '@safe-global/protocol-kit';

const safeFactory = await SafeFactory.create({ ethProvider });
const safeSdk = await safeFactory.deploySafe({
  safeAccountConfig: {
    owners: [owner1, owner2, owner3],
    threshold: 2
  }
});
```

## Development Utilities

### 1. Environment Management

```bash
# .env file
PRIVATE_KEY=0x...
INFURA_API_KEY=...
ETHERSCAN_API_KEY=...
NETWORK_RPC_URL=https://...
```

### 2. TypeChain - Generate Types from ABI

```bash
# Generate TypeScript types from contract ABI
npm install --save-dev typechain

# Generate
typechain --target ethers-v6 --out-dir types artifacts/*.json

# Usage
import { Vault__factory } from './types';
const vault = Vault__factory.connect(address, signer);
```

### 3. Hardhat Plugins

```javascript
// hardhat.config.js
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
```

## Debugging Tools

### 1. Hardhat Console

```bash
# Inspect state in Hardhat console
npx hardhat console

# Then in console:
> const vault = await ethers.getContractAt("Vault", "0x...")
> await vault.totalDeposits()
> await vault.allowance("0x...", "0x...")
```

### 2. Tenderly

```bash
# Web3 debugging platform
# Real-time transaction inspection
# Contract interaction tracking
tenderly.co
```

### 3. BlockScout

```bash
# Local block explorer
# View contracts, transactions, events
# Docker deployment available
docker run -e ETHEREUM_JSONRPC_HTTP_URL=http://host.docker.internal:8545 blockscout
```

## Testing Infrastructure

### 1. CI/CD for Smart Contracts

```yaml
# GitHub Actions example
name: Test Smart Contracts

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx hardhat test
      - run: npx hardhat coverage
```

### 2. Pre-commit Hooks

```bash
# Install husky
npm install husky --save-dev

# Add pre-commit checks
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## Performance Monitoring

### 1. Metrics to Track

- **Gas Usage** - Per transaction
- **Deploy Time** - Time to mine tx
- **Query Speed** - Block explorer queries
- **Latency** - RPC response time

### 2. Example Dashboard

```javascript
// Collect metrics
const metrics = {
  deployGas: 2_500_000,
  depositGas: 45_000,
  withdrawalGas: 55_000,
  averageConfirmationTime: 12 // seconds
};

// Send to monitoring service
sendMetrics(metrics);
```

## Resources & Links

### Official Docs
- [Hardhat Docs](https://hardhat.org/)
- [Ethers.js](https://docs.ethers.org/)
- [Solidity](https://docs.soliditylang.org/)

### Tools
- [Remix IDE](https://remix.ethereum.org/) - Browser-based development
- [VSCode Extensions](https://marketplace.visualstudio.com/) - Solidity support
- [Tenderly](https://tenderly.co/) - Debugging & monitoring
- [The Graph](https://thegraph.com/) - Data indexing

### Security
- [Slither](https://github.com/crytic/slither) - Static analysis
- [OpenZeppelin Audit](https://openzeppelin.com/security-audits-audit-service/)
- [Immunefi](https://immunefi.com/) - Bug bounties

### Communities
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
- [Discord Communities](https://discord.gg/ethereum/)
- [Reddit r/solidity](https://reddit.com/r/solidity/)

---

Last Updated: March 2026
