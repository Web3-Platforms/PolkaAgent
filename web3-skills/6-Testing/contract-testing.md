# Smart Contract Testing Guide

## Overview

Comprehensive testing ensures reliability and catches bugs before deployment.

## Test Types

### 1. Unit Tests

Testing individual functions in isolation:

```javascript
describe("AegisVault - Unit Tests", () => {
  describe("deposit()", () => {
    it("should increase user balance", async () => {
      const amount = ethers.parseEther("100");
      await token.approve(vault.address, amount);
      await vault.deposit(amount);

      const balance = await vault.userDeposits(owner.address);
      expect(balance).to.equal(amount);
    });

    it("should reject zero amount", async () => {
      await expect(vault.deposit(0))
        .to.be.revertedWith("Amount must be > 0");
    });

    it("should reject without approval", async () => {
      await expect(vault.deposit(ethers.parseEther("100")))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });
  });
});
```

### 2. Integration Tests

Testing interactions between contracts:

```javascript
describe("AegisVault - Integration Tests", () => {
  it("should route yield through XCM when risk score is good", async () => {
    // Setup
    await vault.deposit(ethers.parseEther("1000"));

    // Oracle validates deposit is safe
    await oracle.setRiskScore(50); // Safe score

    // Trigger yield routing
    const tx = await vault.routeYield(ethers.parseEther("100"));

    // Verify XCM was called
    expect(tx).to.emit(vault, "YieldRouted");
  });

  it("should prevent yield routing when risk score is high", async () => {
    await vault.deposit(ethers.parseEther("1000"));
    await oracle.setRiskScore(80); // Risky!

    await expect(vault.routeYield(ethers.parseEther("100")))
      .to.be.revertedWith("Risk score too high");
  });
});
```

### 3. Edge Case Tests

Testing boundary conditions:

```javascript
describe("AegisVault - Edge Cases", () => {
  it("handles maximum deposit amount", async () => {
    const maxAmount = ethers.MaxUint256;
    await token.mint(owner.address, maxAmount);
    // Should handle gracefully or revert with clear message
  });

  it("handles minimum deposit amount", async () => {
    await vault.deposit(1); // 1 wei
    expect(await vault.userDeposits(owner.address)).to.equal(1);
  });

  it("calculates interest correctly over time", async () => {
    const depositAmount = ethers.parseEther("100");
    await vault.deposit(depositAmount);

    const day = 86400; // seconds
    await ethers.provider.send("evm_increaseTime", [day]);
    await ethers.provider.send("evm_mine");

    const expectedInterest = depositAmount.mul(5).div(100).div(365); // ~0.014%
    const actual = await vault.calculateInterest(owner.address);
    
    expect(actual).to.be.closeTo(expectedInterest, 1);
  });
});
```

### 4. Scenario Tests

Testing realistic user workflows:

```javascript
describe("AegisVault - Scenarios", () => {
  it("multi-user yield farming scenario", async () => {
    const [owner, user1, user2] = await ethers.getSigners();

    // User 1 deposits
    await token.connect(user1).approve(vault.address, ethers.parseEther("100"));
    await vault.connect(user1).deposit(ethers.parseEther("100"));

    // User 2 deposits
    await token.connect(user2).approve(vault.address, ethers.parseEther("200"));
    await vault.connect(user2).deposit(ethers.parseEther("200"));

    // Time passes
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 3600]);

    // Both users harvest rewards
    const rewards1 = await vault.connect(user1).harvest();
    const rewards2 = await vault.connect(user2).harvest();

    // User 2 deposited 2x, should earn roughly 2x
    expect(rewards2).to.be.closeTo(rewards1 * 2n, ethers.parseEther("1"));
  });
});
```

### 5. Property-Based Tests (Fuzz)

Testing with random inputs:

```javascript
for (const seed of generateRandomSeeds(1000)) {
  const randomAmount = BigInt(Math.floor(Math.random() * 1e18));
  
  it(`should handle deposit of ${randomAmount}`, async () => {
    if (randomAmount === 0n) return; // Skip invalid

    await token.approve(vault.address, randomAmount);
    await vault.deposit(randomAmount);

    // Property: balance should equal deposit
    expect(await vault.userDeposits(owner.address))
      .to.equal(randomAmount);
  });
}
```

## Hardhat Testing Tools

### 1. Forking Mainnet

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    hardhat: {
      forking: {
        enabled: process.env.FORKING === 'true',
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        blockNumber: 18000000 // Specific block
      }
    }
  }
};

// Test with mainnet state
it("works with mainnet state", async () => {
  // Has access to real Uniswap, etc.
  const uniswapV3 = await ethers.getContractAt("IUniswapV3Router", "0x...");
  // Test using real mainnet contracts
});
```

### 2. Gas Testing

```javascript
it("deposit should use < 100k gas", async () => {
  const tx = await vault.deposit(ethers.parseEther("100"));
  const receipt = await tx.wait();

  console.log(`Gas used: ${receipt.gasUsed}`);
  expect(receipt.gasUsed).to.be.lt(100000);
});

// Run with gas reporting
// REPORT_GAS=true npx hardhat test
```

### 3. Benchmark Testing

```javascript
benchmark("deposit performance", async () => {
  const amount = ethers.parseEther("100");
  
  for (let i = 0; i < 100; i++) {
    await vault.deposit(amount);
  }
});
```

## Test Coverage

```bash
# Generate coverage report
npx hardhat coverage

# Expected output:
# -------|----------|----------|----------|----------|
# File   |  % Stmts | % Branch | % Funcs  | % Lines  |
# -------|----------|----------|----------|----------|
# Vault  |   100    |   95     |   100    |   100    |
```

### Interpreting Coverage

- **Statements** - Percentage of code lines executed
- **Branches** - All if/else paths taken
- **Functions** - All functions called at least once
- **Lines** - All lines touched during tests

**Goal:** 100% coverage for critical functions, 90%+ overall

## Advanced Testing

### 1. Snapshot Testing

```javascript
it("snapshot: contract state after operations", async () => {
  await vault.deposit(ethers.parseEther("100"));
  
  const snapshot = {
    totalDeposits: await vault.totalDeposits(),
    userBalance: await vault.userDeposits(owner.address),
    lastTransaction: await ethers.provider.getBlock('latest')
  };

  expect(snapshot).to.matchSnapshot();
});
```

### 2. Mutation Testing

Verify tests catch intentional code changes:

```javascript
// Original
if (amount > 0) { } // ✅

// Mutant
if (amount >= 0) { } // Should break tests

// Tests catch this? If not, tests aren't thorough
```

### 3. Stress Testing

```javascript
it("handles 10000 consecutive deposits", async () => {
  for (let i = 0; i < 10000; i++) {
    await vault.deposit(1);
  }

  expect(await vault.totalDeposits()).to.equal(10000);
});
```

## Test Reporting

```bash
# Detailed test output
npx hardhat test --verbose

# JSON report for CI/CD
npx hardhat test --reporter json > results.json

# HTML coverage report
npx hardhat coverage --reporter html
# Open coverage/index.html
```

## Best Practices

1. **Arrange-Act-Assert** - Clear test structure
2. **One Assertion per Test** - Easier to debug failures
3. **Descriptive Names** - Test name should explain behavior
4. **Isolation** - No test dependencies
5. **DRY** - Use fixtures and beforeEach
6. **Speed** - Tests should run < 1 minute total
7. **Repeatability** - Same result every run
8. **Coverage** - Aim for 100% on critical paths

---

Last Updated: March 2026
