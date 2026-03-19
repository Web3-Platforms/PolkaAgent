# Token Standards (ERC20, ERC721, ERC1155) Guide

## Token Fundamentals

Tokens are the foundation of blockchain applications. Different standards serve different purposes.

## ERC20 - Fungible Tokens

Standard for replaceable, identical tokens (currency, stablecoins, governance tokens).

### Standard Interface

```solidity
interface IERC20 {
    // Query Functions
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    // Mutation Functions
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

### Standard Implementation

```solidity
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("My Token", "MTK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
```

### Common ERC20 Extensions

| Extension | Purpose | Example |
|-----------|---------|---------|
| ERC20Burnable | Allow token burning | `token.burn(amount)` |
| ERC20Capped | Max supply limit | 1M token cap |
| ERC20Snapshot | Historical balance tracking | Governance snapshots |
| ERC20Votes | Voting power delegation | `token.delegate(voter)` |
| ERC20Permit | Approve via signature | No separate approve tx |
| ERC20Wrapper | Wrap other tokens | Wrapped ETH (WETH) |

### Real-World Examples

```solidity
// Stablecoin (USDC-like)
contract USDC is ERC20 {
    address public minter;
    uint8 public constant DECIMALS = 6;

    constructor() ERC20("USD Coin", "USDC") {
        minter = msg.sender;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

// Governance Token
contract GovernanceToken is ERC20 {
    constructor() ERC20("Governance Token", "GOV") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    function delegate(address delegatee) external {
        _delegate(msg.sender, delegatee);
    }
}
```

## ERC721 - Non-Fungible Tokens (NFTs)

For unique, individually valuable tokens.

### Standard Interface

```solidity
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}
```

### Implementation

```solidity
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private tokenCounter;
    mapping(uint256 => string) private tokenURIs;

    constructor() ERC721("My NFT", "NFT") {}

    function mint(address to, string memory uri) external onlyOwner {
        _safeMint(to, tokenCounter);
        tokenURIs[tokenCounter] = uri;
        tokenCounter++;
    }

    function burn(uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId), "Not owner");
        _burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return tokenURIs[tokenId];
    }
}
```

### Metadata Standard (ERC721Metadata)

```json
{
  "name": "Asset Name",
  "description": "Asset description",
  "image": "ipfs://QmX...",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Level",
      "value": 99
    }
  ]
}
```

### ERC721 Extensions

| Extension | Purpose |
|-----------|---------|
| ERC721Enumerable | Iterate over tokens |
| ERC721Burnable | Allow token burning |
| ERC721URIStorage | Token URI storage |
| ERC721Royalty | Creator royalties |

## ERC1155 - Multi-Token Standard

For contracts managing multiple token types (fungible and non-fungible together).

### Use Cases

- **Gaming** - Both currency and items in one contract
- **Fractional NFTs** - 1000 shares of 1 unique NFT
- **Collections** - Multiple related assets
- **Derivatives** - Options, futures, etc.

### Standard Interface

```solidity
interface IERC1155 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids)
        external view returns (uint256[] memory);

    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address account, address operator) external view returns (bool);

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external;

    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
}
```

### Implementation

```solidity
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MultiAsset is ERC1155 {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant SWORD = 2;

    constructor() ERC1155("ipfs://Qm.../{id}.json") {
        // Mint initial supply
        _mint(msg.sender, GOLD, 1000 * 10 ** 18, "");
        _mint(msg.sender, SWORD, 10, "");
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
}
```

## Token Comparison

| Feature | ERC20 | ERC721 | ERC1155 |
|---------|-------|--------|---------|
| Fungible | Yes | No | Mixed |
| Identical Units | Yes | No | Per ID |
| Use Gas | Low | High | Medium |
| Batch Transfer | No | No | Yes |
| Complexity | Low | Medium | High |
| Best For | Currency | Unique assets | Complex systems |

## Practical Implementations

### 1. Stablecoin Pattern

```solidity
// USDC-like stablecoin
contract Stablecoin is ERC20 {
    address public minter;
    uint8 decimals = 6;

    function mint(address account, uint256 amount) external onlyMinter {
        _mint(account, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

### 2. Governance Token Pattern

```solidity
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    constructor() ERC20("DAO Token", "DAO") {}

    // Users can delegate voting power
}
```

### 3. Staking Reward Token

```solidity
contract StakingReward is ERC20 {
    mapping(address => uint256) public staked;
    
    function stake(uint256 amount) external {
        _burn(msg.sender, amount);
        staked[msg.sender] += amount;
    }

    function unstake(uint256 amount) external {
        staked[msg.sender] -= amount;
        _mint(msg.sender, amount);
    }

    function collectRewards() external {
        uint256 reward = calculateReward(msg.sender);
        _mint(msg.sender, reward);
    }
}
```

## Security Considerations

### ERC20 Hazards

```solidity
// ⚠️ Non-standard ERC20 implementations exist!
// Use SafeERC20 for safety
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SafeProtocol {
    using SafeERC20 for IERC20;

    function safeTransfer(IERC20 token, address to, uint256 amount) external {
        token.safeTransfer(to, amount); // Handles edge cases
    }
}
```

### ERC721 Reentrancy

```solidity
// ERC721 can trigger onERC721Received callback
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SafeNFT is ReentrancyGuard {
    function transferNFT(address nft, address to, uint256 tokenId)
        external
        nonReentrant
    {
        IERC721(nft).transferFrom(address(this), to, tokenId);
    }
}
```

---

Last Updated: March 2026
