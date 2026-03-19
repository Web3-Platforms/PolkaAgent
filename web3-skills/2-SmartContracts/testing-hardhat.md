# Testing & Hardhat Guide

## Overview

Comprehensive smart contract testing ensures reliability and security. Hardhat is the industry-standard development environment.

## Hardhat Setup

### 1. Installation

```bash
npm install -D hardhat @nomicfoundation/hardhat-toolbox
npx hardhat
```

### 2. Configuration

```javascript
// hardhat.config.js
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}
```

## Writing Tests

### 1. Basic Test Structure

```javascript
// test/Vault.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AegisVault", function () {
  let vault, token, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy contracts
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy();

    const Vault = await ethers.getContractFactory("AegisVault");
    vault = await Vault.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });
  });

  describe("Deposits", function () {
    it("Should accept deposits", async function () {
      await token.approve(vault.address, ethers.parseEther("100"));
      await vault.deposit(ethers.parseEther("100"));

      expect(await vault.userDeposits(owner.address))
        .to.equal(ethers.parseEther("100"));
    });
  });
});
```

### 2. Assertions

```javascript
// Equality
expect(value).to.equal(expected);
expect(value).to.deep.equal(expected);

// Existence
expect(value).to.exist;
expect(value).to.not.be.undefined;

// Numbers
expect(value).to.be.gt(0);
expect(value).to.be.gte(1000);
expect(value).to.be.lt(100);
expect(value).to.be.lte(50);

// Strings
expect(str).to.include("substring");
expect(str).to.match(/regex/);

// Arrays
expect(array).to.include(element);
expect(array).to.have.length(3);

// Flags
expect(boolean).to.be.true;
expect(boolean).to.be.false;
```

## Testing Patterns

### 1. Testing Reverts

```javascript
it("Should revert on invalid amount", async function () {
  await expect(vault.deposit(0))
    .to.be.revertedWith("Amount must be > 0");
});

// Custom error (Solidity 0.8+)
it("Should revert with custom error", async function () {
  await expect(vault.deposit(0))
    .to.be.revertedWithCustomError(vault, "InvalidAmount");
});
```

### 2. Testing Events

```javascript
it("Should emit Deposit event", async function () {
  await token.approve(vault.address, ethers.parseEther("100"));
  
  await expect(vault.deposit(ethers.parseEther("100")))
    .to.emit(vault, "Deposit")
    .withArgs(owner.address, ethers.parseEther("100"));
});
```

### 3. Testing Transactions

```javascript
it("Should update balance after deposit", async function () {
  const tx = await vault.deposit(ethers.parseEther("100"));
  const receipt = await tx.wait();

  expect(receipt.status).to.equal(1); // Success
  expect(await vault.getBalance(owner.address))
    .to.equal(ethers.parseEther("100"));
});
```

### 4. Testing Access Control

```javascript
it("Only owner can withdraw", async function () {
  await expect(vault.connect(user).emergencyWithdraw())
    .to.be.revertedWith("Ownable: caller is not the owner");
});
```

### 5. Testing State Changes

```javascript
it("Should update total deposits", async function () {
  const before = await vault.totalDeposits();
  await vault.deposit(ethers.parseEther("100"));
  const after = await vault.totalDeposits();

  expect(after).to.equal(before + ethers.parseEther("100"));
});
```

## Advanced Testing

### 1. Mocking & Stubs

```javascript
it("Should work with mocked oracle", async function () {
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const oracle = await MockOracle.deploy();
  
  // Set mock price
  await oracle.setPrice(ethers.parseEther("100"));
  
  await vault.setOracle(oracle.address);
  const price = await vault.getPrice();
  
  expect(price).to.equal(ethers.parseEther("100"));
});
```

### 2. Time Manipulation

```javascript
it("Should handle time-locked operations", async function () {
  await vault.lockFunds();
  
  // Fast forward 1 day
  await ethers.provider.send("evm_increaseTime", [86400]);
  await ethers.provider.send("evm_mine");
  
  // Should now be withdrawable
  expect(await vault.isWithdrawable()).to.be.true;
});
```

### 3. Snapshot & Restore

```javascript
it("Should rollback state", async function () {
  const snapshot = await ethers.provider.send("evm_snapshot");
  
  await vault.deposit(ethers.parseEther("100"));
  expect(await vault.totalDeposits()).to.equal(ethers.parseEther("100"));
  
  // Restore previous state
  await ethers.provider.send("evm_revert", [snapshot]);
  expect(await vault.totalDeposits()).to.equal(0);
});
```

### 4. Impersonation

```javascript
it("Should work when impersonating account", async function () {
  const richAddress = "0x...";
  
  // Impersonate wealthy account
  await ethers.provider.send("hardhat_impersonateAccount", [richAddress]);
  const signer = await ethers.getSigner(richAddress);
  
  // Fund the account with ETH
  await owner.sendTransaction({
    to: richAddress,
    value: ethers.parseEther("10")
  });
  
  // Now use as signer
  await vault.connect(signer).deposit(ethers.parseEther("100"));
});
```

## Test Organization

### 1. Describe Blocks

```javascript
describe("AegisVault", function () {
  describe("Deployment", function () {
    it("Should set correct owner", async function () {});
  });

  describe("Deposits", function () {
    it("Should accept deposits", async function () {});
    it("Should update total", async function () {});
  });

  describe("Withdrawals", function () {
    it("Should allow withdrawals", async function () {});
  });
});
```

### 2. Test Fixtures

```javascript
async function deployVaultFixture() {
  [owner, user, otherUser] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("MockERC20");
  const token = await Token.deploy();

  const Vault = await ethers.getContractFactory("AegisVault");
  const vault = await Vault.deploy(owner.address);

  return { vault, token, owner, user, otherUser };
}

describe("AegisVault", function () {
  it("Should work", async function () {
    const { vault, token, owner } = await deployVaultFixture();
    // Test using fixture
  });
});
```

## Test Coverage

### 1. Generate Coverage Report

```bash
npx hardhat coverage
```

### 2. Coverage Goals

```
Statements   : 100% - Every line executed
Branches     : 100% - Every condition tested (if/else)
Functions    : 100% - Every function called
Lines        : 100% - Every line covered
```

### 3. Hardhat Configuration for Coverage

```javascript
module.exports = {
  // ...
  coverage: {
    provider: "hardhat",
    skipFiles: ["node_modules/", "test/"]
  }
}
```

## Running Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/Vault.test.js

# Run specific test
npx hardhat test --grep "Deposit"

# Show gas usage
REPORT_GAS=true npx hardhat test

# Parallel execution
npx hardhat test --parallel
```

## Best Practices

1. **Descriptive Names** - Test names should clearly state what they test
2. **Small Tests** - Each test should verify one thing
3. **Arrange-Act-Assert** - Clear test structure
4. **DRY Code** - Use beforeEach to avoid repetition
5. **Edge Cases** - Test boundaries and error conditions
6. **Isolation** - Tests should not depend on other tests
7. **Performance** - Keep tests fast for rapid feedback
8. **Coverage** - Aim for 100% code coverage

## Example: Comprehensive Test Suite

```javascript
describe("AegisVault", function () {
  let vault, token, oracle, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy();

    const Vault = await ethers.getContractFactory("AegisVault");
    vault = await Vault.deploy(owner.address);

    const Oracle = await ethers.getContractFactory("MockOracle");
    oracle = await Oracle.deploy();

    await vault.setOracle(oracle.address);
  });

  describe("Basic Operations", function () {
    it("Should deposit funds", async function () {
      await token.approve(vault.address, ethers.parseEther("100"));
      await vault.deposit(ethers.parseEther("100"));
      expect(await vault.getBalance(owner.address))
        .to.equal(ethers.parseEther("100"));
    });

    it("Should withdraw funds", async function () {
      await token.approve(vault.address, ethers.parseEther("100"));
      await vault.deposit(ethers.parseEther("100"));
      await vault.withdraw(ethers.parseEther("100"));
      expect(await vault.getBalance(owner.address)).to.equal(0);
    });
  });

  describe("Security", function () {
    it("Should prevent non-owner admin actions", async function () {
      await expect(vault.connect(user).emergencyPause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Gas Efficiency", function () {
    it("Should deposit efficiently", async function () {
      await token.approve(vault.address, ethers.parseEther("1000"));
      const tx = await vault.deposit(ethers.parseEther("1000"));
      const receipt = await tx.wait();
      console.log("Gas used:", receipt.gasUsed.toString());
    });
  });
});
```

## Resources

- [Hardhat Documentation](https://hardhat.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Ethers.js API](https://docs.ethers.org/)
- [Testing Best Practices](https://ethereum.org/en/developers/docs/testing/)

---

Last Updated: March 2026
