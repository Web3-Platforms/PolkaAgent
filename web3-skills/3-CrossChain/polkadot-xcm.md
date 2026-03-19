# Polkadot XCM (Cross-Consensus Messaging) Guide

## Overview

XCM is Polkadot's protocol for passing messages between parachains and the relay chain. It enables cross-chain asset transfers and interactions.

## Core Concepts

### 1. Location Format

Locations identify assets and chains:

```javascript
// Relay chain
{ Parents: 1 }

// Parachain 2000
{ Parents: 1, Interior: { Parachain: 2000 } }

// Account on current parachain
{ Parents: 0, Interior: { AccountId32: { network: 'any', id: [...] } } }

// Asset on specific parachain
{ 
  Parents: 1, 
  Interior: { 
    X2: [
      { Parachain: 2000 },
      { GeneralIndex: 0 }
    ]
  }
}
```

### 2. Asset Specifier

```javascript
// Native asset
{ Concrete: { Parents: 0 } }

// Specific token
{
  Concrete: {
    Parents: 1,
    Interior: {
      X2: [
        { Parachain: 2000 },
        { GeneralIndex: 0 }
      ]
    }
  }
}

// Amount
{
  Fungible: 1_000_000_000_000  // Amount in smallest unit
}
```

## Message Composition

### 1. WithdrawAsset + DepositAsset

```javascript
// Withdraw from origin chain and deposit to destination
const instructions = [
  {
    WithdrawAsset: [
      {
        id: { Concrete: { Parents: 0 } },
        fun: { Fungible: 1_000_000_000_000 }
      }
    ]
  },
  {
    DepositAsset: {
      assets: { Wild: 'All' },
      beneficiary: destinationAccountLocation
    }
  }
];
```

### 2. ReserveAssetDeposited

```javascript
// For assets originating on target chain
const instructions = [
  {
    ReserveAssetDeposited: [asset]
  },
  {
    DepositAsset: {
      assets: { Wild: 'All' },
      beneficiary: accountLocation
    }
  }
];
```

### 3. InitiateReserveWithdraw

```javascript
// Initiate withdrawal through reserve chain
const instructions = [
  {
    InitiateReserveWithdraw: {
      reserves: assets,
      weightLimit: 'Unlimited'
    }
  }
];
```

## Common Patterns

### 1. Cross-Chain Transfer

```javascript
// Send asset from Parachain A to Parachain B

const xcmMessage = [
  {
    WithdrawAsset: [
      {
        id: { Concrete: { Parents: 0 } },
        fun: { Fungible: amount }
      }
    ]
  },
  {
    DepositReserveAsset: {
      assets: { Wild: 'All' },
      dest: {
        Parents: 1,
        Interior: { Parachain: 2000 }
      },
      xcm: [
        {
          DepositAsset: {
            assets: { Wild: 'All' },
            beneficiary: {
              Parents: 0,
              Interior: { AccountId32: { network: 'any', id: recipientId } }
            }
          }
        }
      ]
    }
  }
];
```

### 2. Teleport (for trust-based chains)

```javascript
// Fast transfer using teleport (no reserve needed)

const xcmMessage = [
  {
    ReceiveTeleportedAsset: [asset]
  },
  {
    ClearOrigin: null
  },
  {
    DepositAsset: {
      assets: { Wild: 'All' },
      beneficiary: destinationAccount
    }
  }
];
```

### 3. Execute Transact

```javascript
// Execute call on target chain

const xcmMessage = [
  {
    Transact: {
      originKind: 'SovereignAccount',
      requireWeightAtMost: 'Unlimited',
      call: {
        encoded: encodedCallData
      }
    }
  },
  {
    RefundSurplus: null
  },
  {
    DepositAsset: {
      assets: { Wild: 'All' },
      beneficiary: sender
    }
  }
];
```

## Solidity Integration (EVM Parachain)

### 1. Sending XCM from EVM

```solidity
pragma solidity >=0.8.0;

interface XCMPortal {
    function execute(bytes memory xcmMessage) external;
}

contract XCMSender {
    address constant XCM_PORTAL = 0x...;

    function sendCrossChainAsset(
        uint256 amountInSmallestUnit,
        bytes memory destinationAccountEncoded,
        uint32 destinationParachainId
    ) external {
        // Build XCM message
        bytes memory xcmMessage = buildWithdrawAndDepositMessage(
            amountInSmallestUnit,
            destinationAccountEncoded,
            destinationParachainId
        );

        // Send via XCM portal
        XCMPortal(XCM_PORTAL).execute(xcmMessage);
    }

    function buildWithdrawAndDepositMessage(
        uint256 amount,
        bytes memory destination,
        uint32 paraId
    ) internal pure returns (bytes memory) {
        // Encode XCM instructions
        // This is chain-specific implementation
        return abi.encode(amount, destination, paraId);
    }
}
```

### 2. Receiving XCM Assets

```solidity
interface XCMReceiver {
    function onXCMReceive(
        address indexed asset,
        uint256 amount,
        address indexed beneficiary
    ) external;
}

contract XCMRecipient is XCMReceiver {
    event XCMAssetReceived(address indexed asset, uint256 amount, address indexed to);

    function onXCMReceive(
        address asset,
        uint256 amount,
        address beneficiary
    ) external override {
        // Handle incoming XCM asset
        emit XCMAssetReceived(asset, amount, beneficiary);
    }
}
```

## Weight & Execution

### 1. Weight Calculation

```javascript
// XCM instructions consume weight (computational resources)

const xcmMessage = [
  {
    WithdrawAsset: [asset]  // ~1,000,000 weight
  },
  {
    DepositAsset: {         // ~1,000,000 weight
      assets: 'All',
      beneficiary: location
    }
  }
  // Total ~2,000,000 weight
];

// Must be within chain's max XCM weight
const maxWeight = 30_000_000_000;  // 30 seconds on typical chain
```

### 2. Weight Limit Handling

```javascript
const safeMessage = [
  {
    WithdrawAsset: [asset]
  },
  {
    DepositAsset: {
      assets: { Wild: 'All' },
      beneficiary: destination,
      weightLimit: {
        Limited: 5_000_000_000  // Limit execution weight
      }
    }
  }
];
```

## Error Handling

### 1. Common XCM Errors

| Error | Cause | Solution |
|-------|-------|----------|
| ExecutionFailed | Instruction failed | Check asset availability |
| UntrustedReserveLocation | Reserve chain unknown | Use correct chain ID |
| UntrustedTeleportLocation | Teleport not enabled | Use reserve transfer |
| Overflow | Number too large | Use smaller amounts |
| AssetNotFound | Asset missing | Verify asset registration |

### 2. Testing XCM Messages

```javascript
// Use Polkadot testnet (Westend)
// Test parachain transfers safely before mainnet

const testMessage = buildXcmMessage(
  destinationParachain,
  amount,
  beneficiary
);

// Validate message structure
console.log(JSON.stringify(testMessage, null, 2));

// Check against XCM schemas
```

## Best Practices

1. **Always Use Reserve Assets** - More reliable than teleport
2. **Test on Testnet First** - Westend before production
3. **Include Instruction Weights** - Prevent execution failures
4. **Verify Chain IDs** - Double-check destination parachain
5. **Handle Failures Gracefully** - Provide refund mechanism
6. **Use Asset Registry** - Register assets before transfer
7. **Monitor Fees** - XCM transfers incur costs
8. **Document Routes** - Track multi-chain paths

## Development Tools

### 1. Polkadot XCM Utilities

```bash
npm install @polkadot/xcm-builder
```

### 2. Simulation

```javascript
import { XcmBuilder } from '@polkadot/xcm-builder';

const xcm = new XcmBuilder()
  .withdraw({
    asset: nativeAsset,
    amount: 1_000_000_000_000
  })
  .deposit({
    destination: parachain2000,
    beneficiary: accountId
  })
  .build();

// Simulate execution
const result = await api.simulation.executeXcm(xcm);
```

## Resources

- [Polkadot XCM Documentation](https://wiki.polkadot.network/docs/xcm)
- [XCM Format](https://github.com/paritytech/xcm-format)
- [Polkadot.js API](https://polkadot.js.org/docs/)
- [XCM Playground](https://xcm.app/)

---

Last Updated: March 2026
