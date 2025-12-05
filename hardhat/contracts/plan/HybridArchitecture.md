# Hybrid Architecture: Polymarket + Base Bounty System

## Overview

Instead of creating a completely separate market contract, we can use a **hybrid approach** that:
1. **Leverages Polymarket** for market creation and trading (on Polygon)
2. **Adds a bounty layer on Base** for incentivizing event makers
3. **Uses UMA** for resolution (works on both chains)

## Architecture Options

### Option 1: Polymarket Market + Base Bounty Contract (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                    User Flow                            │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   Polymarket     │              │  Base Bounty     │
│   (Polygon)      │              │  Contract        │
│                  │              │                  │
│ • Market Creation│              │ • Bounty Pool   │
│ • Trading        │◄─────────────┤ • Proof Submit   │
│ • Liquidity      │   Market ID  │ • Verification   │
│ • UMA Resolution │              │ • Distribution   │
└──────────────────┘              └──────────────────┘
        │                                   │
        └─────────────────┬─────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  UMA Oracle  │
                  │  (Resolution)│
                  └──────────────┘
```

**How it works:**
1. Market created on Polymarket (or via their API)
2. Corresponding bounty contract created on Base with same market ID
3. Users bet on Polymarket (standard flow)
4. Users can also contribute to Base bounty pool (optional)
5. When someone makes event happen, they submit proof to Base contract
6. UMA resolves the market (can be triggered from either chain)
7. Base contract distributes bounty to verified claimant
8. Polymarket handles standard payouts

### Option 2: Base-Only with Polymarket Integration

Create markets on Base, but:
- Use Polymarket's API for market discovery
- Display Polymarket markets in our UI
- Create corresponding Base markets
- Use UMA for resolution
- Add bounty layer on top

## Recommended Implementation

### Contract Structure

```solidity
// Base Bounty Contract
contract BountyMarket {
    // Links to Polymarket market
    mapping(uint256 => string) public polymarketMarketId; // Base marketId => Polymarket market ID
    
    // Bounty pools
    mapping(uint256 => uint256) public bountyPools;
    mapping(uint256 => address) public bountyClaimants;
    
    // Create bounty market linked to Polymarket
    function createBountyMarket(
        string memory polymarketId,
        uint256 deadline
    ) external returns (uint256);
    
    // Contribute to bounty pool
    function contributeToBounty(uint256 marketId) external payable;
    
    // Submit proof (after deadline)
    function submitProof(
        uint256 marketId,
        string memory imageHash // IPFS hash
    ) external;
    
    // Admin verifies proof
    function verifyProof(
        uint256 marketId,
        address claimant
    ) external onlyAdmin;
    
    // Resolve using UMA result
    function resolveWithUMA(
        uint256 marketId,
        bool outcome,
        uint256 umaRequestId
    ) external;
}
```

### Integration Flow

1. **Market Creation**
   ```typescript
   // Option A: Create on Polymarket first
   const polymarketMarket = await createPolymarketMarket(question, description);
   
   // Option B: Create on Base first, then create on Polymarket
   const baseMarketId = await createBaseMarket(question, description);
   const polymarketMarket = await createPolymarketMarket(question, description);
   
   // Link them
   await linkMarkets(baseMarketId, polymarketMarket.id);
   ```

2. **Bounty Contribution**
   ```solidity
   // Users can contribute to bounty pool separately
   bountyMarket.contributeToBounty(marketId);
   ```

3. **Proof Submission**
   ```solidity
   // After deadline, someone makes event happen
   bountyMarket.submitProof(marketId, ipfsHash);
   ```

4. **UMA Resolution**
   ```solidity
   // UMA resolves the market
   // Our contract listens to UMA result
   bountyMarket.resolveWithUMA(marketId, true, umaRequestId);
   ```

## Benefits of Hybrid Approach

✅ **Leverage Polymarket's Infrastructure**
- Use their market creation tools
- Benefit from their liquidity
- Use their UMA integration

✅ **Add Unique Value on Base**
- Bounty system is unique to us
- Lower gas costs on Base
- Base ecosystem integration

✅ **Best of Both Worlds**
- Polymarket handles standard prediction market
- Base handles bounty incentives
- UMA provides trustless resolution

## Implementation Steps

### Phase 1: Base Bounty Contract
- Create standalone bounty contract on Base
- Link to Polymarket markets via market ID
- Handle proof submission and verification
- Integrate with UMA for resolution

### Phase 2: Polymarket Integration
- Use Polymarket API to fetch markets
- Create corresponding Base bounty markets
- Sync market states

### Phase 3: UMA Integration
- Set up UMA Optimistic Oracle
- Submit resolution requests
- Listen to UMA results
- Trigger bounty distribution

## Code Structure

```
contracts/
├── BountyMarket.sol          # Base bounty contract
├── UMAResolver.sol           # UMA integration
└── PolymarketAdapter.sol     # Polymarket API integration (off-chain)

app/
├── lib/
│   ├── polymarket.ts         # Polymarket API client
│   ├── uma.ts                # UMA integration
│   └── hooks/
│       ├── usePolymarket.ts  # Polymarket market hooks
│       └── useBounty.ts      # Bounty contract hooks
```

## Alternative: Simplified Approach

For hackathon, we can simplify:

1. **Create markets on Base** (our contract)
2. **Use Polymarket API** for market discovery/inspiration
3. **Use UMA** for resolution
4. **Add bounty layer** on top

This is simpler and doesn't require cross-chain complexity, but still leverages Polymarket's ecosystem.

