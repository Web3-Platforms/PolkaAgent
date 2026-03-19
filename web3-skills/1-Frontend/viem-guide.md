# Viem: Lightweight Ethereum Library Guide

## Overview

Viem is a modern, lightweight TypeScript/JavaScript library for interacting with Ethereum and EVM-compatible blockchains. It emphasizes type safety, composability, and performance.

## Key Features

- **Lightweight & Tree-shakeable** - Minimal bundle size with optimal code splitting
- **Type-Safe** - Full TypeScript support with automatic type inference from ABIs
- **Modular** - Use only what you need (public client, wallet client, etc.)
- **High Performance** - Optimized architecture for speed and efficiency
- **Browser Native BigInt** - Use native BigInt instead of large numerical libraries
- **First-class Smart Contract Support** - Encode/decode ABIs, inspect contracts
- **Development Tool Integration** - Works seamlessly with Hardhat, Anvil, Ganache

## Core Concepts

### 1. Client Setup

```javascript
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

**Types of Clients:**
- **PublicClient** - Read-only operations (balance, block data, etc.)
- **WalletClient** - Write operations (transactions, signing)
- **TestClient** - Testing utilities for local development

### 2. Reading Blockchain Data

**Common read operations:**
- `getBlockNumber()` - Get current block
- `getBalance()` - Get account balance
- `getTransactionCount()` - Get nonce for account
- `getCode()` - Get contract bytecode
- `call()` - Execute contract call without state change
- `readContract()` - Type-safe contract reads

### 3. Writing to Blockchain

**Transaction workflow:**
```javascript
// 1. Write transaction
const hash = await client.writeContract({
  account,
  address: tokenAddress,
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: [to, amount]
})

// 2. Wait for confirmation
const receipt = await client.waitForTransactionReceipt({ hash })
```

### 4. Contract Interaction

**Reading contracts:**
```javascript
const balance = await publicClient.readContract({
  address: tokenAddress,
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: [userAddress]
})
```

**Writing contracts:**
```javascript
const hash = await walletClient.writeContract({
  account: userAddress,
  address: tokenAddress,
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: [recipientAddress, BigInt(amount)]
})
```

### 5. ABI Utilities

- **parseAbi()** - Create type-safe ABI from human-readable format
- **encodeFunctionData()** - Encode function calls
- **decodeFunctionResult()** - Decode return data
- **encodeEventLog()** - Encode events
- **decodeEventLog()** - Decode event logs

## Best Practices

1. **Use Separate Clients** - Distinct public and wallet clients for clear separation
2. **Type Your ABIs** - Use const assertions for better type inference
3. **Error Handling** - Always handle network and contract errors
4. **Chain Awareness** - Ensure client chain matches intended network
5. **Gas Estimation** - Pre-estimate gas before sending transactions
6. **Wallet Integration** - Use injected providers for browser wallets

## Common Patterns

### Pattern 1: Reading ERC20 Balance
```javascript
// Read token balance with type safety
const balance = await client.readContract({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [userAddress]
})
```

### Pattern 2: Transaction with Confirmation
```javascript
// Send transaction and confirm
const hash = await walletClient.sendTransaction({
  to: recipientAddress,
  value: BigInt(amount),
  account: userAccount
})

const receipt = await client.waitForTransactionReceipt({ hash })
console.log('Confirmed at block:', receipt.blockNumber)
```

### Pattern 3: Batch Calls
```javascript
// Efficient batch reading
const multicallResults = await client.multicall({
  contracts: [
    { address, abi, functionName: 'balanceOf', args: [address1] },
    { address, abi, functionName: 'balanceOf', args: [address2] }
  ]
})
```

## Comparison with Alternatives

| Aspect | Viem | Ethers.js | Web3.js |
|--------|------|----------|---------|
| Bundle Size | ✅ Small | Medium | Large |
| TypeScript | ✅ First-class | Good | Good |
| Modularity | ✅ Highly | Some | Limited |
| Learning Curve | Medium | Easy | Moderate |
| Performance | ✅ Excellent | Good | Good |

## Resources

- Official Documentation: viem.sh
- GitHub: github.com/wevm/viem
- Examples: viem.sh/examples
- Community: GitHub Discussions

## Common Gotchas

1. **BigInt Handling** - Always use BigInt for large numbers
2. **ABI Inference** - Use `as const` for ABI type inference
3. **Chain Verification** - Double-check chain configuration
4. **Account Format** - Ensure proper account object format
5. **Gas Estimation** - Estimate gas for new contract interactions

---

Last Updated: March 2026
