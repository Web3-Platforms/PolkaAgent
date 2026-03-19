# Multi-Chain Architecture & Bridge Patterns

## Cross-Chain Landscape

```
┌─────────────┐       ┌──────────┐       ┌─────────────┐
│  Ethereum   │◄─────►│  Bridge  │◄─────►│  Polkadot   │
└─────────────┘       └──────────┘       └─────────────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
              Liquidity pooled
              across chains
```

## Bridge Types

### 1. Lock-and-Mint Bridges

**How it works:**
1. Lock asset on source chain
2. Mint equivalent on destination chain
3. On return: burn on destination, unlock on source

```solidity
// Source Chain (Ethereum)
contract SourceBridge {
    IERC20 token;
    mapping(address => uint256) locked;

    function lockToken(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        locked[msg.sender] += amount;
        emit TokenLocked(msg.sender, amount);
    }

    function unlockToken(uint256 amount) external {
        locked[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }
}

// Destination Chain (Polkadot Parachain)
contract DestinationBridge {
    IERC20 wrappedToken;

    function mintWrapped(address user, uint256 amount) external onlyValidator {
        wrappedToken.mint(user, amount);
        emit WrappedTokenMinted(user, amount);
    }

    function burnWrapped(uint256 amount) external {
        wrappedToken.burn(msg.sender, amount);
        emit WrappedTokenBurned(msg.sender, amount);
    }
}
```

### 2. Liquidity Pool Bridges

**How it works:**
1. Swap asset for wrapped asset from pool
2. LP provides liquidity on both sides
3. Economic incentive for rebalancing

```solidity
contract LiquidityBridge {
    mapping(bytes32 => Pool) pools;

    struct Pool {
        uint256 sourceBalance;
        uint256 destBalance;
        uint256 lpShares;
    }

    function swapToDest(
        address token,
        uint256 amount,
        uint256 minReceive
    ) external returns (uint256) {
        // Calculate swap amount using bonding curve
        uint256 feeAmount = (amount * feeRate) / 10000;
        uint256 swapAmount = amount - feeAmount;

        // Deposit source, receive destination
        uint256 receiveAmount = calculateReceived(swapAmount);
        require(receiveAmount >= minReceive, "Slippage");

        token.transferFrom(msg.sender, address(this), amount);
        // Emit event for validators to mint on dest chain
        emit SwapInitiated(msg.sender, token, amount, receiveAmount);

        return receiveAmount;
    }

    function calculateReceived(uint256 amount) internal view returns (uint256) {
        // Bonding curve: output = sourceBalance - (sourceBalance * destBalance)/(destBalance + amount)
        return destBalance - (destBalance * sourceBalance) / (sourceBalance + amount);
    }
}
```

### 3. Light Client / Relay Bridges

**How it works:**
1. Light client of source chain runs on destination
2. Validators relay headers periodically
3. Users can prove transaction inclusion

```solidity
contract LightClientBridge {
    mapping(uint256 => bytes32) blockHeaders;
    uint256 lastHeaderBlock;

    function relayHeader(uint256 blockNum, bytes32 headerHash) external {
        require(blockNum > lastHeaderBlock, "Old header");
        blockHeaders[blockNum] = headerHash;
        lastHeaderBlock = blockNum;
    }

    function verifyTransaction(
        uint256 blockNum,
        bytes calldata txProof,
        bytes calldata transaction
    ) external view returns (bool) {
        bytes32 blockHash = blockHeaders[blockNum];
        return verifyMerkleProof(blockHash, txProof, transaction);
    }
}
```

## Multi-Chain Design Patterns

### 1. Asset Distribution

```
Strategy: Deploy main token on one chain,
          wrap on others using bridge

Example:
- ETH: Main on Ethereum, wrapped on Polkadot
- USDC: Main on multiple (omni-chain stablecoin)
- Governance Tokens: Main on one chain, wrapped elsewhere
```

### 2. Liquidity Strategy

```javascript
// Allocate TVL across chains based on:
- Transaction costs
- User distribution
- Reward incentives
- Risk parameters

Example allocation for $1B TVL:
- Ethereum (high gas): 40% ($400M)
- Polygon (low gas): 35% ($350M)
- Polkadot (high control): 25% ($250M)
```

### 3. Composability Across Chains

```solidity
// Order: Ethereum → Polkadot → Ethereum

// 1. Initiate on source
contract SourceV3 {
    function routeYieldXChain() external {
        // 1. Send 100 ETH to Polkadot
        bridge.sendAsset(polkadotAddress, 100 ether);
    }
}

// 2. Process on intermediate
contract PolkadotParachain {
    function receiveYieldRouting() external {
        // 2. Do some DeFi magic
        // 3. Stake/yield farm
        // 4. Send back when done
    }
}

// 3. Finalize on destination
contract DestinationV3 {
    function receiveYieldReturn() external {
        // 3. Distribute rewards
    }
}
```

## Common Challenges

### 1. Liquidity Fragmentation

```
Problem: Limited liquidity on each chain
Solution: Automated market maker (AMM) on each chain
         Synchronize prices via arbitrage bots

Price Formula: P_ETH = 1 ETH, P_Polygon = varies
Arbitrageur: Buys cheap on one, sells expensive on other
```

### 2. Asynchronous Confirmation

```
Chain A: Confirms transaction in ~12 seconds
Chain B: Confirms in ~6 blocks = ~90 seconds

Solution:
- Optimistic finality (assume confirmed, revert if needed)
- User waits for pessimistic finality
- Insurance pool covers potential losses
```

### 3. Atomic Multi-Chain Swaps

```solidity
// Problem: Can't guarantee atomicity across chains
// Solution: Use hash time-locked contracts (HTLCs)

contract HTLC {
    bytes32 hashlock;
    uint256 timelock;
    address claimer;

    function claim(string memory preimage) external {
        require(sha256(abi.encode(preimage)) == hashlock);
        // Pay claimer
    }

    function refund() external {
        require(block.timestamp > timelock);
        // Refund sender
    }
}
```

## Gas Optimization Across Chains

```javascript
// Strategy: Different chains for different operations

// High-frequency, low-value: Polygon
- Individual trades
- Small transfers
- User interactions

// Medium-frequency, medium-value: Arbitrum/Optimism
- Governance votes
- Medium-sized positions
- Analytics queries

// Low-frequency, high-value: Ethereum
- Large deposits
- Governance proposal execution
- Security-critical operations
```

## Security in Multi-Chain

### 1. Validator Set Management

```solidity
contract ValidatorSet {
    mapping(address => bool) public validators;
    uint256 public quorum = 2; // 2-of-3 multisig

    function addValidator(address val) external onlyGovernance {
        validators[val] = true;
    }

    function validateBridgeTransaction(
        bytes[] calldata signatures,
        bytes calldata data
    ) external view returns (bool) {
        uint256 validCount = 0;
        for (uint i = 0; i < signatures.length; i++) {
            if (validators[recoverSigner(data, signatures[i])]) {
                validCount++;
            }
        }
        return validCount >= quorum;
    }
}
```

### 2. Amount Limits

```solidity
contract BridgeWithLimits {
    mapping(address => DailyLimit) limits;

    struct DailyLimit {
        uint256 amount;
        uint256 lastReset;
    }

    function bridges_with_limit(address token, uint256 amount) external {
        DailyLimit storage limit = limits[msg.sender];

        // Reset daily limit
        if (block.timestamp >= limit.lastReset + 1 days) {
            limit.amount = 0;
            limit.lastReset = block.timestamp;
        }

        limit.amount += amount;
        require(limit.amount <= DAILY_MAX, "Daily limit exceeded");

        // Process bridge
    }
}
```

---

Last Updated: March 2026
