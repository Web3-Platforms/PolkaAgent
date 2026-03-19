# Solidity Best Practices Guide

## Overview

Solidity best practices ensure secure, efficient, and maintainable smart contracts. This guide covers proven patterns and conventions.

## Code Structure

### 1. File Organization

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// 1. Imports
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// 2. Interfaces
interface IOracle {
    function getPrice(address token) external view returns (uint256);
}

// 3. Contract definition
contract Vault is ReentrancyGuard, Ownable {
    // 4. Type declarations
    // 5. State variables
    // 6. Events
    // 7. Modifiers
    // 8. Constructor
    // 9. External functions
    // 10. Public functions
    // 11. Internal functions
    // 12. Private functions
    // 13. View functions
}
```

### 2. Naming Conventions

```solidity
// Contract names: PascalCase
contract TokenVault { }

// Function names: camelCase
function deposit(uint256 amount) external { }

// Internal/Private functions: _camelCase
function _mint(address to, uint256 amount) internal { }

// Constants: UPPER_SNAKE_CASE
uint256 public constant MAX_SUPPLY = 1_000_000e18;

// State variables: camelCase
uint256 public totalDeposits;

// Events: PascalCase
event DepositMade(address indexed user, uint256 amount);

// Modifiers: camelCase
modifier onlyActive() {
    require(isActive, "Not active");
    _;
}
```

## State Management

### 1. Efficient Storage Layout

```solidity
// ❌ BAD: Wastes storage slots
contract BadLayout {
    uint8 x;    // 1 byte
    uint256 y;  // 32 bytes - new slot!
    uint8 z;    // 1 byte - new slot!
}

// ✅ GOOD: Optimized storage
contract GoodLayout {
    uint8 x;    // 1 byte
    uint8 z;    // 1 byte (same slot)
    uint256 y;  // 32 bytes (full slot)
}
```

### 2. Using Structs Effectively

```solidity
// Pack related data
struct Deposit {
    uint128 amount;      // 16 bytes
    uint64 timestamp;    // 8 bytes
    uint8 riskScore;     // 1 byte
    bool isActive;       // 1 byte
    // Total: 26 bytes, fits in one slot!
}
```

### 3. Mapping vs Array Trade-offs

```solidity
// Use mappings for: fast lookups, large datasets
mapping(address => uint256) public balances;

// Use arrays for: iteration, ordered data
address[] public tokenList;

// Mapping of arrays: hybrid approach
mapping(address => uint256[]) public deposits;
```

## Function Design

### 1. Function Visibility

```solidity
contract Example {
    // External: Called from outside, cheaper gas
    function publicAction() external { }

    // Public: Can be called internally or externally
    function getBalance() public view returns (uint256) { }

    // Internal: Only within contract and derived contracts
    function _validate() internal { }

    // Private: Only within this contract
    function _internalOnly() private { }
}
```

### 2. Function Purity

```solidity
// Pure: No state access or modification
function add(uint256 a, uint256 b) pure public returns (uint256) {
    return a + b;
}

// View: Read-only, no state changes
function getBalance(address user) view public returns (uint256) {
    return balances[user];
}

// State-modifying: Use with caution
function deposit(uint256 amount) external {
    balances[msg.sender] += amount;
}
```

## Common Patterns

### 1. Checks-Effects-Interactions (CEI)

```solidity
// ✅ CORRECT: Checks first, effects, then external calls
function withdraw(uint256 amount) external {
    // 1. CHECKS
    require(balances[msg.sender] >= amount, "Insufficient balance");

    // 2. EFFECTS
    balances[msg.sender] -= amount;
    totalDeposits -= amount;

    // 3. INTERACTIONS
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}

// ❌ WRONG: External call before state update (reentrancy!)
function withdrawBad(uint256 amount) external {
    (bool success, ) = msg.sender.call{value: amount}("");
    balances[msg.sender] -= amount;  // Vulnerable!
}
```

### 2. Pull over Push Pattern

```solidity
// ❌ DANGEROUS: Push pattern (contract sends funds)
function distributePushBad() external {
    for (uint i = 0; i < recipients.length; i++) {
        (bool success, ) = recipients[i].call{value: amounts[i]}("");
        require(success);  // One failure breaks entire loop
    }
}

// ✅ BETTER: Pull pattern (users withdraw funds)
mapping(address => uint256) public pendingWithdrawals;

function withdrawPull() external {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, "Nothing to withdraw");

    pendingWithdrawals[msg.sender] = 0;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

### 3. Reentrancy Guard

```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SafeVault is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // Protected from reentrancy attacks
    }
}
```

## Security Patterns

### 1. Input Validation

```solidity
function transfer(address to, uint256 amount) external {
    // Validate inputs early
    require(to != address(0), "Invalid recipient");
    require(amount > 0, "Amount must be > 0");
    require(balances[msg.sender] >= amount, "Insufficient balance");

    // Proceed with operation
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

### 2. Access Control

```solidity
// Simple ownership
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner");
    _;
}

// Role-based access
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleManaged is AccessControl {
    bytes32 constant ADMIN_ROLE = keccak256("ADMIN");
    
    function criticalAction() external onlyRole(ADMIN_ROLE) {
        // Only accounts with ADMIN role
    }
}
```

### 3. Safe Math (Solidity 0.8+)

```solidity
// ✅ Solidity 0.8+ has checked arithmetic by default
uint256 x = 2**256 - 1;
uint256 result = x + 1;  // Reverts automatically (overflow)

// ✅ Use unchecked for optimization when safe
unchecked {
    i++;  // Safe increment in loop
}
```

## Gas Optimization

### 1. Minimize Storage Writes

```solidity
// ❌ Inefficient: Multiple writes
for (uint i = 0; i < users.length; i++) {
    totalBalance += balances[users[i]];  // Storage read each iteration
}

// ✅ Efficient: Batch operations
function getTotalBalance() view external returns (uint256) {
    uint256 total = totalBalance;  // Cache in memory
    for (uint i = 0; i < additions.length; i++) {
        total += additions[i];
    }
    return total;
}
```

### 2. Event Indexing

```solidity
// ✅ Index parameters for efficient filtering
event Deposit(
    address indexed user,
    address indexed token,
    uint256 amount,
    uint256 timestamp
);
```

### 3. Tight Variable Packing

```solidity
// ✅ Pack into storage slots efficiently
struct Deposit {
    address user;        // 20 bytes
    uint96 amount;       // 12 bytes = 32 total
    uint32 timestamp;    // 4 bytes
    uint8 riskScore;     // 1 byte = 37 bytes over limit

    // Create second struct for spillover
}
```

## Testing Patterns

```solidity
// Use descriptive test names
function test_DepositIncreasesTotalBalance() external {
    uint256 initialTotal = vault.totalBalance();
    vault.deposit(100e18);
    assertEq(vault.totalBalance(), initialTotal + 100e18);
}

// Test edge cases
function test_DepositZeroAmountReverts() external {
    vm.expectRevert("Amount must be > 0");
    vault.deposit(0);
}

// Test access control
function test_OnlyOwnerCanWithdraw() external {
    vm.prank(notOwner);
    vm.expectRevert("Only owner");
    vault.withdrawAll();
}
```

## Common Mistakes to Avoid

1. **Reentrancy** - Always use CEI pattern or ReentrancyGuard
2. **Integer Overflow/Underflow** - Validate mathematical operations
3. **Unchecked External Calls** - Always check return values
4. **Logic Errors** - Test edge cases thoroughly
5. **Gas Inefficiency** - Optimize storage and loops
6. **Missing Events** - Emit events for state changes
7. **Hardcoded Values** - Use constants and parameters

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity by Example](https://solidity-by-example.org/)
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)

---

Last Updated: March 2026
