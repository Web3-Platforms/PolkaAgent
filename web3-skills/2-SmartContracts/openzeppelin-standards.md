# OpenZeppelin Standards & Libraries

## Overview

OpenZeppelin provides battle-tested, audited smart contract libraries implementing standard interfaces and security patterns.

## Core ERC Standards

### 1. ERC20 - Fungible Tokens

```solidity
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("My Token", "MTK") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}
```

**Key Functions:**
- `transfer(to, amount)` - Transfer tokens
- `approve(spender, amount)` - Allow spending
- `transferFrom(from, to, amount)` - Transfer on behalf
- `balanceOf(account)` - Get balance
- `totalSupply()` - Get total supply

### 2. ERC721 - Non-Fungible Tokens (NFTs)

```solidity
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    uint256 private _tokenCounter;

    constructor() ERC721("My NFT", "NFT") {}

    function mint(address to) external {
        _safeMint(to, _tokenCounter);
        _tokenCounter++;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return string(abi.encodePacked("ipfs://Qm...", tokenId));
    }
}
```

**Key Functions:**
- `mint(to, tokenId)` - Create new NFT
- `burn(tokenId)` - Destroy NFT
- `ownerOf(tokenId)` - Get NFT owner
- `transferFrom(from, to, tokenId)` - Transfer NFT
- `approve(to, tokenId)` - Approve transfer

### 3. ERC1155 - Multi-Token Standard

```solidity
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MyToken is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address account, uint256 id, uint256 amount) external {
        _mint(account, id, amount, "");
    }

    function mintBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external {
        _mintBatch(account, ids, amounts, "");
    }
}
```

**Key Functions:**
- `mint(account, id, amount, data)` - Mint tokens
- `burn(account, id, amount)` - Burn tokens
- `balanceOf(account, id)` - Get token balance
- `balanceOfBatch()` - Get multiple balances

## Access Control

### 1. Ownable Pattern

```solidity
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Governed is Ownable {
    function criticalFunction() external onlyOwner {
        // Only owner can call
    }
}
```

### 2. Role-Based Access Control (RBAC)

```solidity
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleManaged is AccessControl {
    bytes32 constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 constant MINTER_ROLE = keccak256("MINTER");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        // Only minters can call
    }

    function grantMinterRole(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }
}
```

### 3. Ownable2Step - Safer Ownership Transfer

```solidity
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract SafeTransfer is Ownable2Step {
    function transferOwnership(address newOwner) public override onlyOwner {
        // Requires acceptance from new owner
        _transferOwnership(newOwner);
    }
}
```

## Security Features

### 1. ReentrancyGuard

```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SafeContract is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // Protected from reentrancy
    }
}
```

### 2. Pausable Contracts

```solidity
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PausableVault is Pausable, Ownable {
    function deposit() external whenNotPaused {
        // Can be paused
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
```

## Token Utilities

### 1. SafeERC20

```solidity
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SafeSwap {
    using SafeERC20 for IERC20;

    function swapToken(
        IERC20 token,
        address recipient,
        uint256 amount
    ) external {
        // Handles edge cases like missing returnValue
        token.safeTransfer(recipient, amount);
    }
}
```

**Why Use SafeERC20:**
- Handles non-standard ERC20 implementations
- Protects against reentrancy
- Checks transfer success

### 2. SafeERC20 Permit

```solidity
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PermitVault {
    using SafeERC20 for IERC20;

    function depositWithPermit(
        IERC20 token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        token.permit(msg.sender, address(this), amount, deadline, v, r, s);
        token.safeTransferFrom(msg.sender, address(this), amount);
    }
}
```

## Upgradeability

### 1. Transparent Proxy Pattern

```solidity
import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

// Deploy implementation
Vault implementation = new Vault();

// Deploy proxy pointing to implementation
TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
    address(implementation),
    proxyAdmin,
    ""
);

// Use as normal contract
Vault vault = Vault(address(proxy));
```

### 2. UUPS Proxy Pattern

```solidity
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract UpgradeableVault is UUPSUpgradeable, Ownable {
    // Implementation logic

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
```

## Hooks & Extensions

### 1. Token Hooks

```solidity
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VotingToken is ERC20 {
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._update(from, to, amount);
        
        // Custom logic on transfer
        _updateVotingPower(from, to, amount);
    }
}
```

### 2. Access Control Hooks

```solidity
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract AuditedAccess is AccessControl {
    event RoleGrantedAudited(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    function _grantRole(bytes32 role, address account)
        internal
        override
    {
        super._grantRole(role, account);
        emit RoleGrantedAudited(role, account, msg.sender);
    }
}
```

## Common Patterns

### 1. Burnable Tokens

```solidity
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BurnableToken is ERC20Burnable {
    constructor() ERC20("Burnable", "BURN") {}
}

// Usage
token.burn(amount); // Self-destruct tokens
token.burnFrom(account, amount); // Burn on behalf
```

### 2. Capped Supply

```solidity
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract CappedToken is ERC20Capped {
    constructor(uint256 cap) ERC20("Capped", "CAP") ERC20Capped(cap) {}
}
```

### 3. Voting Tokens

```solidity
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    constructor() ERC20("Governance", "GOV") {}

    function _update(address from, address to, uint256 amount)
        internal
        override
    {
        super._update(from, to, amount);
    }
}
```

## Best Practices

1. **Use Audited Libraries** - OpenZeppelin contracts are battle-tested
2. **Understand Inheritance** - Know how contracts interact
3. **Read Documentation** - Each contract has specific requirements
4. **Test Integrations** - Test your custom logic with OZ contracts
5. **Keep Updated** - Update OpenZeppelin regularly for security fixes
6. **Avoid Storing in Proxies** - Be careful with storage in upgradeable
7. **Override Hooks Carefully** - Follow ordering when overriding

## Versions & Compatibility

```bash
# Latest version
npm install @openzeppelin/contracts

# Specific version (recommended)
npm install @openzeppelin/contracts@5.6.1
```

**Version Compatibility:**
- 5.x - Latest, Solidity 0.8.20+
- 4.x - Stable, Solidity 0.8+
- 3.x - Legacy, Solidity 0.7

## Resources

- [OpenZeppelin Contracts Documentation](https://docs.openzeppelin.com/contracts/)
- [GitHub Repository](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Forum & Support](https://forum.openzeppelin.com/)
- [Upgrading Guide](https://docs.openzeppelin.com/upgrades/getting-started)

---

Last Updated: March 2026
