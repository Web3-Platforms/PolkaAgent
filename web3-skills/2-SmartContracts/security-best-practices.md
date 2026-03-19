# Smart Contract Security Best Practices

## Overview

Security is paramount in smart contracts. Once deployed, code is immutable and governs real assets. This guide covers essential security practices.

## Common Vulnerabilities

### 1. Reentrancy

**Risk:** Attacker recursively calls functions before state is updated.

```solidity
// ❌ VULNERABLE
function withdraw(uint256 amount) external {
    require(balance[msg.sender] >= amount);
    
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    
    balance[msg.sender] -= amount;  // Updated AFTER external call!
}

// ✅ SECURE: Use CEI pattern
function withdraw(uint256 amount) external {
    require(balance[msg.sender] >= amount);
    
    balance[msg.sender] -= amount;  // Update state FIRST
    
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}

// ✅ SECURE: Use ReentrancyGuard
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Safe is ReentrancyGuard {
    function withdraw(uint256 amount) external nonReentrant {
        // Protected
    }
}
```

### 2. Integer Overflow/Underflow

**Risk:** Integer math exceeds limits.

```solidity
// ✅ Solidity 0.8+ protects by default
uint256 x = type(uint256).max;
x += 1;  // Reverts automatically

// ⚠️ unchecked can bypass protection
unchecked {
    x += 1;  // Overflows without revert!
}
```

### 3. Timestamp Dependence

**Risk:** Using block.timestamp for critical logic.

```solidity
// ❌ DANGEROUS: Relying on exact timestamp
if (block.timestamp == expected) { }

// ⚠️ RISKY: Miners can manipulate timestamps
if (block.timestamp > now + 1 days) { }

// ✅ BETTER: Use block numbers or ranges
if (block.number >= targetBlock + 1000) { }

// ✅ BEST: Use ranges, not exact values
if (block.timestamp > cliffTime) { }
```

### 4. Delegatecall Vulnerabilities

**Risk:** Unsafe delegatecall can modify caller's state.

```solidity
// ❌ DANGEROUS: Unverified delegatecall
(bool success, ) = target.delegatecall(data);

// ✅ SAFER: Validate target and use minimal interfaces
interface SafeTarget {
    function execute() external;
}

// Still verify target is trusted
```

### 5. Front-Running

**Risk:** Attackers see pending transactions and act first.

```solidity
// ❌ VULNERABLE: Price visible before execution
function swap(uint256 amountIn, uint256 minAmountOut) external {
    uint256 amountOut = calculatePrice(amountIn);
    require(amountOut >= minAmountOut);
    // Execute swap
}

// ✅ BETTER: Use private mempools (Flashbots)
// ✅ BETTER: Use MEV-resistant protocols
// ✅ BETTER: Implement slippage protection
```

### 6. Access Control Issues

**Risk:** Insufficient permission checks.

```solidity
// ❌ MISSING: No access control
function withdrawFunds() external {
    (bool success, ) = msg.sender.call{value: address(this).balance}("");
}

// ✅ PROPER: Check permissions
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Controlled is Ownable {
    function withdrawFunds() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
    }
}
```

## Security Checklist

### Before Deployment

- [ ] All functions have appropriate access controls
- [ ] Input validation on all user inputs
- [ ] No delegatecall to user-controlled addresses
- [ ] CEI pattern used correctly
- [ ] No reentrancy vulnerabilities (use ReentrancyGuard if needed)
- [ ] No timestamp dependencies for critical logic
- [ ] Integer math is safe (or documented as intentional)
- [ ] External calls wrapped in try-catch or require
- [ ] Events emitted for all state changes
- [ ] Storage layout is gas-efficient and safe

### External Call Safety

```solidity
// ✅ Safe external call pattern
function externalCall() external {
    require(msg.sender == trusted, "Untrusted caller");
    
    // 1. Update state first (CEI)
    isProcessed = true;
    
    // 2. Make external call
    (bool success, ) = externalAddress.call{value: 0}(
        abi.encodeWithSignature("function()")
    );
    
    // 3. Handle failure
    require(success, "External call failed");
}
```

## Testing for Security

### 1. Fuzz Testing

```solidity
// Test with random inputs
function testFuzzDeposit(uint256 amount) external {
    vm.assume(amount > 0 && amount < type(uint256).max);
    
    uint256 before = vault.totalBalance();
    vault.deposit(amount);
    uint256 after = vault.totalBalance();
    
    assertEq(after, before + amount);
}
```

### 2. Invariant Testing

```solidity
// Verify invariants hold across operations
function invariant_BalanceAlwaysNonNegative() external {
    for (uint i = 0; i < users.length; i++) {
        assertGt(user_balance[users[i]], 0);
    }
}
```

### 3. Attack Scenario Testing

```solidity
// Test for specific vulnerabilities
function test_CannotReentrancy() external {
    // Setup reentrant contract
    ReentrantAttacker attacker = new ReentrantAttacker(address(vault));
    
    // Should fail with ReentrancyGuard
    vm.expectRevert("ReentrancyGuard: reentrant call");
    vault.deposit{value: 1 ether}(attacker);
}
```

## Audit Recommendations

### Code Review Points

1. **Authorization** - Who can call what?
2. **State Changes** - Verify all state changes are correct
3. **External Calls** - Are all handled safely?
4. **Math** - Is arithmetic correct?
5. **Events** - Are important events emitted?
6. **Gas** - Can budget be exploited?

### Tools for Analysis

```bash
# Static analysis
slither Vault.sol

# Formal verification
certora verify Vault.sol

# Fuzz testing
forge fuzz

# Test coverage
forge coverage
```

## Best Practices Summary

1. **Minimize Attack Surface** - Keep contracts simple
2. **Defense in Depth** - Multiple layers of protection
3. **Fail Safely** - Default to safe state on errors
4. **Separation of Concerns** - Different functions for different tasks
5. **Transparency** - Clear logic and good documentation
6. **Testing** - Comprehensive test coverage
7. **Upgradeable Pattern** - Use proxies for critical fixes
8. **Monitoring** - Alert on unusual activity

## Emergency Procedures

```solidity
// Circuit breaker pattern
bool public paused;

modifier whenNotPaused() {
    require(!paused, "Contract is paused");
    _;
}

modifier onlyOwner() {
    require(msg.sender == owner, "Only owner");
    _;
}

function pause() external onlyOwner {
    paused = true;
    emit ContractPaused();
}

function unpause() external onlyOwner {
    paused = false;
    emit ContractUnpaused();
}

function emergencyWithdraw() external onlyOwner {
    (bool success, ) = owner.call{value: address(this).balance}("");
    require(success);
}
```

## Resources

- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/security/)
- [Ethereum Smart Contract Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)
- [ConsenSys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [PIVX Audit Checklist](https://github.com/crytic/audit-checklist)

---

Last Updated: March 2026
