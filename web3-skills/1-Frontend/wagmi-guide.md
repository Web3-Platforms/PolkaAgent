# Wagmi: React Hooks for Ethereum Guide

## Overview

Wagmi is a React library providing hooks for interacting with Ethereum. It's built on top of Viem and designed specifically for React applications, providing elegant state management and hook-based patterns.

## Key Features

- **React Hooks** - Use composition with React hooks pattern
- **Type-Safe** - Full TypeScript support with ABI inference
- **Extensible** - Build custom hooks easily
- **Wallet Connectors** - Built-in support for popular wallets
- **Chain Support** - Works with any EVM chain
- **Query Integration** - Built-in React Query/TanStack Query support
- **Connector Ecosystem** - MetaMask, WalletConnect, Coinbase, etc.

## Core Setup

### 1. Installation & Configuration

```bash
npm install wagmi viem @tanstack/react-query
```

### 2. Provider Setup

```javascript
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector(),
  ],
  publicClient: publicClient,
  webSocketPublicClient: webSocketPublicClient,
})

export function App() {
  return (
    <WagmiConfig config={config}>
      <YourApp />
    </WagmiConfig>
  )
}
```

## Essential Hooks

### 1. Account Hooks

**useAccount()** - Get connected account info
```javascript
const { address, isConnected, isConnecting } = useAccount()
```

**useBalance()** - Get account balance
```javascript
const { data, isLoading } = useBalance({ address })
```

**useContractRead()** - Read contract data
```javascript
const { data, isLoading } = useContractRead({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [address]
})
```

### 2. Transaction Hooks

**useContractWrite()** - Write to contract
```javascript
const { write, isLoading } = useContractWrite({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'transfer'
})

const handleTransfer = () => {
  write({
    args: [recipientAddress, amount]
  })
}
```

**useSendTransaction()** - Send raw transaction
```javascript
const { sendTransaction } = useSendTransaction()

sendTransaction({
  to: address,
  value: parseEther('1.0')
})
```

**useWaitForTransaction()** - Wait for confirmation
```javascript
const { data, isLoading } = useWaitForTransaction({
  hash: transactionHash
})
```

### 3. Connection Hooks

**useConnect()** - Connect wallet
```javascript
const { connect, connectors, isLoading } = useConnect()

return (
  <>
    {connectors.map(connector => (
      <button
        key={connector.id}
        onClick={() => connect({ connector })}
      >
        {connector.name}
      </button>
    ))}
  </>
)
```

**useDisconnect()** - Disconnect wallet
```javascript
const { disconnect } = useDisconnect()
```

### 4. Network & Chain Hooks

**useNetwork()** - Get current network
```javascript
const { chain, chains } = useNetwork()
```

**useSwitchNetwork()** - Switch chains
```javascript
const { switchNetwork } = useSwitchNetwork()

switchNetwork?.(mainnet.id)
```

## Common Patterns

### Pattern 1: Deposit Form
```javascript
function DepositForm({ tokenAddress }) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')

  const { write: approve, isLoading: isApproving } = useContractWrite({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve'
  })

  const { write: deposit, isLoading: isDepositing } = useContractWrite({
    address: vaultAddress,
    abi: vaultAbi,
    functionName: 'deposit'
  })

  const handleDeposit = async () => {
    approve({
      args: [vaultAddress, parseEther(amount)],
      onSuccess: () => {
        deposit({
          args: [parseEther(amount)]
        })
      }
    })
  }

  return (
    <button 
      onClick={handleDeposit}
      disabled={isApproving || isDepositing}
    >
      Deposit
    </button>
  )
}
```

### Pattern 2: Real-time Balance
```javascript
function BalanceDisplay({ address }) {
  const { data: balance, isLoading } = useBalance({
    address,
    watch: true // Watch for updates
  })

  if (isLoading) return <div>Loading...</div>

  return <div>Balance: {balance?.formatted} {balance?.symbol}</div>
}
```

### Pattern 3: Transaction Status
```javascript
function TransactionHistory() {
  const { data: transaction } = useWaitForTransaction({
    hash: txHash
  })

  if (!transaction) return <div>Pending...</div>

  return (
    <div>
      <p>Status: {transaction.status}</p>
      <p>Block: {transaction.blockNumber}</p>
      <p>Gas Used: {transaction.gasUsed}</p>
    </div>
  )
}
```

## Advanced Features

### 1. TanStack Query Integration

Wagmi integrates React Query for caching and background updates:

```javascript
// Automatic caching with React Query
const { data: balance } = useBalance({
  address,
  cacheTime: 1000 * 60 * 5, // 5 minutes
  staleTime: 1000 * 60, // 1 minute
})
```

### 2. Custom Hooks

Create reusable logic:

```javascript
function useTransferToken(tokenAddress) {
  const { write, isLoading } = useContractWrite({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'transfer'
  })

  return {
    transfer: (to, amount) => write({ args: [to, amount] }),
    isTransferring: isLoading
  }
}
```

### 3. Multicall Support

Read multiple contracts efficiently:

```javascript
const { data } = useContractReads({
  contracts: [
    {
      address: token1,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address]
    },
    {
      address: token2,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address]
    }
  ]
})
```

## Best Practices

1. **Error Handling** - Always handle errors from hooks
2. **Loading States** - Show loading indicators during transactions
3. **Confirmation Waiting** - Wait for transaction confirmation
4. **User Feedback** - Toast messages for success/failure
5. **Gas Optimization** - Estimate gas before sending
6. **Chain Awareness** - Check current chain before operations
7. **Wallet Detection** - Handle disconnected wallet gracefully

## Wallet Connectors

Supported connectors include:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Safe
- And many more via ecosystem

## Resources

- Official Docs: wagmi.sh
- GitHub: github.com/wevm/wagmi  
- Examples: wagmi.sh/examples
- Discord Community

## Common Gotchas

1. **Not Awaiting Promises** - Some hooks return promises
2. **Missing Providers** - Ensure WagmiConfig wraps app
3. **Chain Mismatch** - User on different chain than app
4. **Wallet Not Connected** - Handle disconnected state
5. **Gas Estimation Failure** - Some calls can't estimate gas

---

Last Updated: March 2026
