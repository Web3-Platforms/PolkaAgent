# dApp Architecture Guide

## Overview

A well-architected dApp (decentralized application) seamlessly integrates frontend, blockchain, and backend services.

## Layered Architecture

```
┌──────────────────────────────────────────────┐
│          User Interface Layer                 │
│  (React, Vue, CLI, Mobile)                   │
├──────────────────────────────────────────────┤
│          State Management Layer               │
│  (Zustand, Redux, React Context)             │
├──────────────────────────────────────────────┤
│          Web3 Integration Layer               │
│  (Wagmi, Ethers.js, Viem)                    │
├──────────────────────────────────────────────┤
│          Backend Services Layer               │
│  (Node.js, Indexing, APIs)                   │
├──────────────────────────────────────────────┤
│          Blockchain Layer                     │
│  (Smart Contracts, Data)                     │
└──────────────────────────────────────────────┘
```

## 1. Frontend Architecture

### Component Structure

```javascript
// components/
//   ├── common/
//   │   ├── Button.tsx
//   │   ├── Card.tsx
//   │   └── Modal.tsx
//   ├── features/
//   │   ├── Wallet/
//   │   │   ├── ConnectButton.tsx
//   │   │   └── WalletInfo.tsx
//   │   ├── Vault/
//   │   │   ├── DepositForm.tsx
//   │   │   └── WithdrawalForm.tsx
//   │   └── Dashboard/
//   │       ├── PortfolioSummary.tsx
//   │       └── TransactionHistory.tsx
//   └── layouts/
//       ├── MainLayout.tsx
//       └── AdminLayout.tsx
```

### State Management Pattern

```typescript
// Store structure
interface AppState {
  wallet: {
    address: string | null;
    isConnected: boolean;
    chain: number;
  };
  vault: {
    balance: BigInt;
    deposits: Deposit[];
    loading: boolean;
  };
  ui: {
    modal: ModalState;
    notifications: Notification[];
  };
}

// Use store query/hooks
const address = useStore(state => state.wallet.address);
const balance = useStore(state => state.vault.balance);
```

## 2. Web3 Integration Layer

### Contract Interaction Service

```typescript
// services/contractService.ts
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

class ContractService {
  private publicClient;
  private walletClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: mainnet,
      transport: http()
    });
  }

  async getBalance(address: string): Promise<bigint> {
    return new Promise((resolve, reject) => {
      this.publicClient.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'balanceOf',
        args: [address]
      })
        .then(resolve)
        .catch(reject);
    });
  }

  async deposit(amount: bigint, account: Account): Promise<string> {
    const walletClient = createWalletClient({
      account,
      chain: mainnet,
      transport: http()
    });

    const hash = await walletClient.writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [amount]
    });

    return hash;
  }
}

export const contractService = new ContractService();
```

### Error Handling Strategy

```typescript
// utils/errorHandler.ts
export class Web3Error extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message);
  }
}

export function handleContractError(error: any): Web3Error {
  if (error.code === 'ACTION_REJECTED') {
    return new Web3Error('USER_REJECTED', 'Transaction rejected by user', error);
  }
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return new Web3Error('INSUFFICIENT_BALANCE', 'Insufficient balance', error);
  }
  if (error.reason?.includes('revert')) {
    return new Web3Error('CONTRACT_REVERT', error.reason, error);
  }
  return new Web3Error('UNKNOWN', 'Unknown error occurred', error);
}
```

## 3. Data Flow Pattern

### Vault Deposit Flow

```
User Input
    ↓
Validation → State Update (loading)
    ↓
Check Allowance {
    ├─ If necessary → Approve Token
    │   ↓ Wait for confirmation
    ├─ Skip if approved
}
    ↓
Send Deposit Transaction
    ↓
Wait for Confirmation
    ↓
Update Local State
    ↓
Show Success/Error
```

### Implementation

```typescript
// hooks/useDeposit.ts
export function useDeposit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Web3Error | null>(null);

  const deposit = async (amount: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const amountBigInt = parseEther(amount);

      // 1. Check allowance
      const allowance = await contractService.getAllowance(account.address);
      
      if (allowance < amountBigInt) {
        // 2. Approve if needed
        const approveTx = await contractService.approve(VAULT_ADDRESS, amountBigInt);
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      // 3. Deposit
      const depositTx = await contractService.deposit(amountBigInt, account);
      await publicClient.waitForTransactionReceipt({ hash: depositTx });

      // 4. Update state
      await refreshBalance();
      
    } catch (err) {
      setError(handleContractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { deposit, isLoading, error };
}
```

## 4. Backend Integration

### REST API Layer

```typescript
// Backend API for indexing and off-chain data
interface VaultAPI {
  // Get user transaction history
  GET /api/vault/history/:address
    → HistoryResponse[]

  // Get vault statistics
  GET /api/vault/stats
    → VaultStats

  // Get AI risk score
  GET /api/risk-oracle
    → RiskScore

  // Submit transaction for monitoring
  POST /api/transactions
    → TransactionId
}
```

### Example Implementation

```typescript
// services/apiService.ts
export class APIService {
  private baseURL = process.env.REACT_APP_API_URL;

  async getVaultStats(): Promise<VaultStats> {
    const response = await fetch(`${this.baseURL}/api/vault/stats`);
    return response.json();
  }

  async getRiskScore(address: string): Promise<RiskScore> {
    const response = await fetch(
      `${this.baseURL}/api/risk-oracle?address=${address}`
    );
    return response.json();
  }

  async submitTransaction(txHash: string, metadata: any) {
    const response = await fetch(`${this.baseURL}/api/transactions`, {
      method: 'POST',
      body: JSON.stringify({ txHash, metadata })
    });
    return response.json();
  }
}

export const apiService = new APIService();
```

## 5. Real-Time Data

### Polling Strategy

```typescript
// hooks/useLiveData.ts
export function useLiveVaultData() {
  const [data, setData] = useState<VaultData | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Poll every 10 seconds
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const stats = await apiService.getVaultStats();
      setData(stats);
    } catch (error) {
      console.error('Failed to fetch vault data:', error);
    }
  }

  return data;
}
```

### WebSocket Alternative

```typescript
// hooks/useRealtimeUpdates.ts
export function useRealtimeUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates(prev => [...prev, update]);
    };

    return () => ws.close();
  }, []);

  return updates;
}
```

## 6. Error Boundaries

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MainApp />
</ErrorBoundary>
```

## 7. Performance Optimization

### Code Splitting

```typescript
// routes/index.ts
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Vault = lazy(() => import('../pages/Vault'));
const Admin = lazy(() => import('../pages/Admin'));

<Suspense fallback={<Loading />}>
  <Route path="/" element={<Dashboard />} />
  <Route path="/vault" element={<Vault />} />
  <Route path="/admin" element={<Admin />} />
</Suspense>
```

### Caching Strategy

```typescript
// utils/cache.ts
class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

## 8. Deployment

```yaml
# docker-compose.yml (Example)
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://backend:3001

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://...
      RPC_URL: https://rpc.chainname.io

  indexer:
    build: ./indexer
    environment:
      ETHEREUM_RPC: https://rpc.chainname.io
```

## Best Practices

1. **Separate Concerns** - Keep UI, logic, and blockchain code separate
2. **Type Safety** - Use TypeScript for better development experience
3. **Error Handling** - Gracefully handle all failure scenarios
4. **Caching** - Reduce redundant contract calls
5. **Testing** - Unit tests for business logic, integration tests for contracts
6. **Monitoring** - Track errors and performance in production
7. **Security** - Validate all inputs, use secure communication
8. **Accessibility** - WCAG compliance for all UI

---

Last Updated: March 2026
