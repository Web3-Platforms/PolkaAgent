# DeFi Fundamentals Guide

## Overview

DeFi (Decentralized Finance) enables financial services without central intermediaries. This guide covers core concepts and patterns.

## Key Concepts

### 1. Smart Contract Protocols

DeFi services are automated by smart contracts:

```
┌─────────────────────────────────┐
│      User Interface (Web/App)   │
├─────────────────────────────────┤
│      Smart Contracts            │
│  ┌─────────────────────────────┐│
│  │ Protocol Logic (AMM, Vault) ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│      Blockchain (Ethereum, etc) │
└─────────────────────────────────┘
```

### 2. Asset Types

- **ERC20** - Fungible tokens (stablecoins, governance)
- **ERC721** - NFTs (collectibles, fractional ownership)
- **ERC1155** - Multi-token (games, derivatives)

### 3. Cross-Chain Considerations

- **Bridges** - Transfer assets between chains
- **Liquidity Fragmentation** - Liquidity split across chains
- **Fee Structure** - Each chain has different costs

## Core DeFi Primitives

### 1. Lending & Borrowing

```solidity
contract LendingProtocol {
    mapping(address => uint256) public deposited;
    mapping(address => uint256) public borrowed;
    uint256 public interestRate = 5; // 5% annual

    function deposit(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        deposited[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        require(deposited[msg.sender] >= amount * 2, "Insufficient collateral");
        borrowed[msg.sender] += amount;
        token.transfer(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        borrowed[msg.sender] -= amount;
    }
}
```

**Key Metrics:**
- **LTV (Loan-to-Value)** - Max borrow vs collateral
- **Liquidation Threshold** - When position becomes liquidatable
- **Interest Rate** - How much borrowers pay

### 2. Automated Market Maker (AMM)

```solidity
// Uniswap-style AMM
contract AMM {
    uint256 public tokenAReserve;
    uint256 public tokenBReserve;
    uint256 constant FEE = 3; // 0.3%

    // Constant product formula: x * y = k
    function swap(address tokenIn, uint256 amountIn) external {
        require(amountIn > 0, "Amount must be > 0");

        uint256 amountInWithFee = amountIn * (10000 - FEE) / 10000;
        uint256 k = tokenAReserve * tokenBReserve;

        bool isTokenA = tokenIn == tokenA;
        if (isTokenA) {
            tokenAReserve += amountInWithFee;
            uint256 amountOut = tokenBReserve - (k / tokenAReserve);
            tokenBReserve = amountOut;
            tokenB.transfer(msg.sender, amountOut);
        }
    }

    function provideLiquidity(uint256 amountA, uint256 amountB) external {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        uint256 shares = sqrt(amountA * amountB);
        lpToken.mint(msg.sender, shares);
    }
}
```

**Key Formula:**
- Spot Price = Reserve_B / Reserve_A
- Output = (Input × Reserve_Out) / (Reserve_In + Input)

### 3. Yield Farming

```solidity
contract YieldFarm {
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public rewards;
    uint256 public rewardRate = 100e18; // Per block

    function stake(uint256 amount) external {
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedAmount[msg.sender] += amount;
    }

    function harvest() external {
        uint256 earned = calculateRewards(msg.sender);
        rewards[msg.sender] = 0;
        rewardToken.transfer(msg.sender, earned);
    }

    function calculateRewards(address user) public view returns (uint256) {
        uint256 blocksStaked = block.number - lastHarvest[user];
        return (stakedAmount[user] * rewardRate * blocksStaked) / 1e18;
    }
}
```

### 4. Flash Loans

```solidity
interface IFlashLoanReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}

contract FlashLoanProvider {
    uint256 public premiumRate = 9; // 0.09%

    function flashLoan(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external {
        uint256 balanceBefore = token.balanceOf(address(this));

        // Transfer loan
        token.transfer(msg.sender, amount);

        // Execute callback
        IFlashLoanReceiver(msg.sender).executeOperation(
            asset,
            amount,
            (amount * premiumRate) / 10000,
            msg.sender,
            params
        );

        // Verify repayment
        uint256 amountWithFee = amount + (amount * premiumRate) / 10000;
        require(
            token.balanceOf(address(this)) >= balanceBefore + amountWithFee,
            "Flash loan not repaid"
        );
    }
}
```

## Risk Management

### 1. Collateralization Requirements

```solidity
contract RiskManagement {
    uint256 constant MIN_COLLATERAL_RATIO = 150; // 150%

    modifier healthCheck() {
        require(
            (collateral[msg.sender] * 100) / borrowed[msg.sender] >= MIN_COLLATERAL_RATIO,
            "Insufficient collateralization"
        );
        _;
    }

    function borrow(uint256 amount) external healthCheck {
        borrowed[msg.sender] += amount;
    }
}
```

### 2. Liquidation Mechanism

```solidity
contract Liquidation {
    uint256 constant LIQUIDATION_THRESHOLD = 125; // 125%

    function liquidate(address account) external {
        uint256 collateralRatio = (collateral[account] * 100) / borrowed[account];

        require(
            collateralRatio < LIQUIDATION_THRESHOLD,
            "Account is healthy"
        );

        // Seize collateral
        uint256 seizableAmount = borrowed[account] * 110 / 100; // 10% penalty
        collateral[account] -= seizableAmount;
        collateral[msg.sender] += seizableAmount;
    }
}
```

### 3. Oracle Risk

```solidity
interface IPriceOracle {
    function getPrice(address asset) external view returns (uint256);
}

contract OracleIntegration {
    IPriceOracle public oracle;

    function getCollateralValue(address user) external view returns (uint256) {
        uint256 amount = collateral[user];
        uint256 price = oracle.getPrice(tokenAddress);
        return amount * price / 1e18;
    }
}
```

## DeFi Risks

| Risk | Description | Mitigation |
|------|-------------|-----------|
| Smart Contract Risk | Code vulnerabilities | Audits, testing |
| Oracle Risk | Manipulated prices | Multiple oracles, decentralized |
| Liquidity Risk | Inability to exit | Sufficient liquidity pools |
| Systemic Risk | Cascade failures | Risk limits, circuit breakers |
| Impermanent Loss | LP holder losses | Careful market making |

## Common DeFi Patterns

### 1. Multi-Step Transactions (using flashloan)

```solidity
// Arbitrage with flash loan
contract Arbitrage {
    function executeArbitrage(
        address pool1,
        address pool2,
        uint256 amount
    ) external {
        // 1. Borrow via flash loan
        // 2. Buy cheap on pool1
        // 3. Sell expensive on pool2
        // 4. Repay flash loan + fees
        // Profit = pool2 proceeds - pool1 cost - fees
    }
}
```

### 2. Governance Token Mechanics

```solidity
contract GovernanceIntegration {
    mapping(address => uint256) public votingPower;

    function stake(uint256 amount) external {
        governanceToken.transferFrom(msg.sender, address(this), amount);
        votingPower[msg.sender] += amount;
    }

    function vote(uint256 proposalId, bool support) external {
        require(votingPower[msg.sender] > 0, "No voting power");
        votes[proposalId][support] += votingPower[msg.sender];
    }
}
```

## Performance Considerations

1. **Gas Optimization** - Minimize storage operations
2. **Batch Operations** - Process multiple actions in one tx
3. **Caching** - Store frequently accessed data
4. **Event Indexing** - Enable efficient off-chain queries

## Resources

- [Uniswap V3 Documentation](https://uniswap.org/)
- [Aave Protocol Docs](https://docs.aave.com/)
- [DeFi Pulse](https://defipulse.com/)
- [DeFi Safety Principles](https://consensys.github.io/smart-contract-best-practices/)

---

Last Updated: March 2026
