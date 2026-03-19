# Web3 Wallet Integration Guide

## Overview

Wallet integration is critical for Web3 applications. It enables users to connect their self-custodial wallets, sign transactions, and interact with smart contracts.

## Popular Wallets

### Browser Extension Wallets
- **MetaMask** - Most popular, EVM chains
- **Trust Wallet** - Multi-chain support
- **Brave Wallet** - Built into Brave browser
- **Coinbase Wallet** - Exchange-backed wallet

### WalletConnect & Mobile
- **WalletConnect** - Protocol for mobile/desktop wallets
- **Rainbow** - Beautiful UX, WalletConnect-compatible
- **Argent** - Account abstraction support
- **Phantom** - Solana + EVM support

## Integration Patterns

### 1. Injected Provider Pattern

```javascript
// Check for wallet
if (typeof window.ethereum !== 'undefined') {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  })
  console.log('Connected:', accounts[0])
}
```

### 2. Using Wagmi with MultiChain Support

```javascript
import { createConfig, configureChains } from 'wagmi'
import { mainnet, polygon, optimism } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism],
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
      }
    })
  ],
  provider
})
```

### 3. Connection Component

```javascript
function WalletConnect() {
  const { connect, connectors, error, isLoading } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map(connector => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={!connector.ready}
          isLoading={isLoading}
        >
          {connector.name}
        </button>
      ))}
      {error && <div>{error.message}</div>}
    </div>
  )
}
```

## Key Operations

### 1. Getting User Account

```javascript
// With Wagmi
const { address, isConnected } = useAccount()

// With raw provider
const accounts = await window.ethereum.request({
  method: 'eth_accounts'
})
```

### 2. Checking Balance

```javascript
const { data: balance } = useBalance({
  address: userAddress
})
```

### 3. Requesting Signature

```javascript
// Sign message
const signature = await walletClient.signMessage({
  account: userAddress,
  message: 'Sign this to verify ownership'
})
```

### 4. Sending Transaction

```javascript
const hash = await walletClient.sendTransaction({
  account: userAddress,
  to: recipientAddress,
  value: parseEther('1.0')
})
```

## Best Practices

### 1. Check Wallet Availability
```javascript
function hasWallet() {
  return typeof window.ethereum !== 'undefined'
}
```

### 2. Handle Connection States
```javascript
const [status, setStatus] = useState('disconnected')
// disconnected, connecting, connected, error
```

### 3. Chain Awareness
```javascript
// Switch chain if needed
const { switchNetwork } = useSwitchNetwork()

if (chain?.id !== targetChainId) {
  switchNetwork?.(targetChainId)
}
```

### 4. Error Handling
```javascript
try {
  const tx = await sendTransaction(...)
  // Handle success
} catch (error) {
  if (error.code === 4001) {
    // User rejected
  } else if (error.code === -32603) {
    // Internal RPC error
  }
}
```

### 5. Persist Connection
```javascript
// Store connection preference
localStorage.setItem('wagmiConnected', true)

// Restore on page reload with autoConnect
```

## User Experience Patterns

### Pattern 1: Smart Connection Flow
```javascript
function useAutoConnect() {
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!isConnected) {
      const lastConnector = localStorage.getItem('lastConnector')
      const connector = connectors.find(c => c.id === lastConnector)
      if (connector?.ready) {
        connect({ connector })
      }
    }
  }, [])
}
```

### Pattern 2: Account Switching Notification
```javascript
function useAccountChange() {
  const { address } = useAccount({
    onConnect: ({ address }) => {
      toast.success(`Connected: ${address}`)
    },
    onDisconnect: () => {
      toast.info('Wallet disconnected')
    }
  })
}
```

### Pattern 3: Chain Switching Validation
```javascript
function useChainGuard(requiredChain) {
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const isCorrectChain = chain?.id === requiredChain

  return {
    isCorrectChain,
    switchToRequired: () => switchNetwork?.(requiredChain)
  }
}
```

## Security Considerations

1. **Never Store Private Keys** - Only use wallet providers
2. **Verify Contract Interaction** - Show users what they're signing
3. **Gas Estimation** - Always estimate before sending
4. **Multiple Confirmations** - Confirm high-value transactions
5. **Timeout Protection** - Handle stalled transactions
6. **Network Verification** - Ensure correct network before operations

## WalletConnect Setup

```javascript
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const connector = new WalletConnectConnector({
  chains,
  options: {
    projectId: 'your-walletconnect-project-id',
    metadata: {
      name: 'Your App',
      description: 'Your App Description',
      url: 'https://yourapp.com',
      icons: ['https://yourapp.com/icon.svg']
    }
  }
})
```

## Resources

- [Wagmi Documentation](https://wagmi.sh)
- [WalletConnect Protocol](https://walletconnect.com)
- [JSON-RPC Spec](https://ethereum.org/en/developers/docs/apis/json-rpc/)
- [MetaMask Provider API](https://docs.metamask.io/guide/provider-integration.html)

---

Last Updated: March 2026
