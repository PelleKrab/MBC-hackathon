# Polymarket Integration Guide

## Overview

This document explains how to integrate Polymarket market creation and interactions through our frontend, while linking Base bounty contracts.

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Our App)              │
│  • Create markets (Polymarket)          │
│  • Place bets (Polymarket)              │
│  • Contribute to bounties (Base)         │
│  • Submit proof (Base)                  │
└─────────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌──────────┐      ┌──────────┐
│Polymarket│      │  Base    │
│(Polygon) │      │  Bounty  │
│          │      │          │
│• Markets │      │• Bounty  │
│• Trading │      │• Proof   │
│• UMA     │      │• Verify  │
└──────────┘      └──────────┘
```

## Implementation Status

### ✅ Completed

1. **Polymarket API Client** (`app/lib/polymarket.ts`)
   - Fetch markets from Polymarket
   - Get market details
   - Get market prices
   - Check resolution status

2. **React Hooks** (`app/lib/hooks/usePolymarket.ts`)
   - `usePolymarketMarkets()` - Fetch markets
   - `usePolymarketMarket()` - Get single market
   - `usePolymarketPrices()` - Get prices
   - `usePolymarketResolved()` - Check resolution

3. **Market Creation UI** (`app/components/CreateMarketModal.tsx`)
   - Create markets on Base
   - Option to create on Polymarket (requires Polygon)
   - Hybrid option (Polymarket + Base bounty)

4. **Bounty Contract Hooks** (`app/lib/hooks/useBountyContract.ts`)
   - `useCreateBountyMarket()` - Create bounty market
   - `useContributeToBounty()` - Contribute to bounty pool

### 🚧 In Progress / TODO

1. **Polymarket Contract Integration**
   - Connect to Polygon network
   - Interact with Polymarket's CTF contracts
   - Place bets through our frontend
   - Create markets on Polymarket

2. **Hybrid Market Linking**
   - Link Polymarket markets to Base bounty contracts
   - Sync market states
   - Display both in UI

3. **UMA Integration**
   - Submit resolutions to UMA
   - Listen to UMA results
   - Trigger bounty distribution

## How It Works

### Creating a Hybrid Market

1. **User clicks "Create Market"**
   - Modal opens with options:
     - Base Only
     - Hybrid (Polymarket + Base)
     - Polymarket Only

2. **User selects "Hybrid"**
   - Fills in question, description, deadlines
   - Submits form

3. **Backend creates markets:**
   ```typescript
   // 1. Create on Polymarket (Polygon)
   const polymarketMarket = await createPolymarketMarket({
     question,
     description,
     endDate: deadline,
   });
   
   // 2. Create Base bounty market linked to Polymarket
   const baseBountyId = await createBountyMarket({
     polymarketId: polymarketMarket.id,
     question,
     deadline,
   });
   ```

4. **Markets are linked:**
   - Base bounty contract stores Polymarket market ID
   - Frontend displays both markets together
   - Users can bet on Polymarket
   - Users can contribute to Base bounty

### Placing Bets

**On Polymarket:**
- User connects Polygon wallet
- Clicks "Bet" on market
- Transaction goes to Polymarket contracts
- Receives conditional tokens

**On Base (Bounty):**
- User connects Base wallet
- Clicks "Contribute to Bounty"
- Sends ETH to Base bounty contract
- Bounty pool increases

### Submitting Proof

1. **User makes event happen**
2. **Takes photo**
3. **Submits proof to Base contract:**
   ```typescript
   await submitProof({
     marketId: baseBountyId,
     imageHash: ipfsHash,
   });
   ```
4. **Admin verifies**
5. **Bounty distributed on resolution**

## API Reference

### Polymarket Client

```typescript
// Fetch markets
const markets = await fetchPolymarketMarkets({ active: true, limit: 50 });

// Get single market
const market = await getPolymarketMarket(marketId);

// Get prices
const { yesPrice, noPrice } = await getPolymarketPrices(marketId);

// Check resolution
const isResolved = await isPolymarketResolved(marketId);
```

### React Hooks

```typescript
// Fetch markets
const { markets, isLoading, error } = usePolymarketMarkets(true);

// Get single market
const { market, isLoading } = usePolymarketMarket(marketId);

// Get prices
const { prices, isLoading } = usePolymarketPrices(marketId);

// Check resolution
const { isResolved, isLoading } = usePolymarketResolved(marketId);
```

## Network Requirements

### Polymarket (Polygon)
- Network: Polygon Mainnet
- Token: USDC
- Contracts: Conditional Tokens Framework (CTF)

### Base Bounty
- Network: Base Mainnet/Sepolia
- Token: ETH
- Contracts: BountyMarket.sol

## Next Steps

1. **Deploy BountyMarket contract** to Base
2. **Set up Polygon wallet connection** in frontend
3. **Implement Polymarket market creation** (requires Polygon)
4. **Link markets** between Polymarket and Base
5. **Add UMA integration** for resolution

## Notes

- For hackathon: Can demo with Base-only markets, mention Polymarket integration
- For production: Full Polymarket integration requires Polygon network setup
- Polymarket uses USDC, Base uses ETH - users need both tokens
- Consider using a bridge or cross-chain solution for seamless UX

