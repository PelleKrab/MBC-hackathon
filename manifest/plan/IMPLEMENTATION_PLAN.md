# Creator Incentive Implementation Plan

## Goal
Create a smart contract system on Base that incentivizes users to create prediction markets by giving them 10% of all winnings from their markets.

## Architecture

### Pool Distribution
- **80%** → Winning side (proportional to stake)
- **10%** → Best timestamp guesser (winner-takes-all)
- **10%** → Market creator (automatic)

### Smart Contract Flow

1. **Market Creation**
   - User calls `createMarket()` with question, description, deadlines
   - Contract stores creator address
   - Market is created with empty pools

2. **Placing Predictions**
   - User calls `placePrediction()` with ETH
   - Contract automatically splits:
     - 80% to YES/NO pool
     - 10% to timestamp pool
     - 10% to creator pool
   - Prediction stored with user address and timestamp guess

3. **Market Resolution**
   - Anyone can call `resolveMarket()` with outcome
   - Contract distributes:
     - 10% to creator (from creatorPool)
     - 10% to best timestamp guesser
     - 80% proportionally to winners

## Implementation Steps

### Phase 1: Smart Contract Development ✅
- [x] Create `PredictionMarket.sol` contract
- [x] Implement market creation with creator tracking
- [x] Implement prediction placement with pool splitting
- [x] Implement market resolution with payout distribution
- [x] Add helper functions (getMarket, calculatePayout, etc.)

### Phase 2: Contract Deployment
- [ ] Set up Hardhat/Foundry project
- [ ] Write deployment script
- [ ] Deploy to Base Sepolia testnet
- [ ] Test all functions
- [ ] Deploy to Base mainnet

### Phase 3: Frontend Integration
- [ ] Create contract interaction hooks
- [ ] Add "Create Market" UI component
- [ ] Update prediction flow to use contract
- [ ] Add market resolution UI
- [ ] Display creator rewards

### Phase 4: Polymarket Integration (Optional)
- [ ] Research Polymarket API
- [ ] Create adapter to sync Polymarket markets
- [ ] Allow users to create markets from Polymarket data
- [ ] Use Polymarket resolution data

## Key Features

### Creator Incentives
- **10% of all bets** go to market creator
- Paid automatically on market resolution
- No additional action required from creator
- Transparent and trustless

### Benefits
- Encourages quality market creation
- Rewards early market makers
- Creates sustainable ecosystem
- Aligns creator incentives with market success

## Technical Details

### Contract Addresses
Update `app/lib/contracts.ts` after deployment:
```typescript
export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: "0x...", // Testnet
  [base.id]: "0x...",        // Mainnet
}
```

### Gas Optimization
- Uses events for off-chain indexing
- Minimal storage operations
- Efficient payout calculations

### Security Considerations
- Reentrancy protection (using `call()`)
- Access control for resolution (consider adding)
- Oracle integration for resolution (future)

## Testing Strategy

1. **Unit Tests**
   - Market creation
   - Prediction placement
   - Pool calculations
   - Payout distribution

2. **Integration Tests**
   - Full market lifecycle
   - Multiple predictions
   - Edge cases (no winners, etc.)

3. **Frontend Tests**
   - Contract interaction
   - Event listening
   - Error handling

## Polymarket Integration Approach

### Option 1: Direct Contract Integration
- Deploy our contract on Base
- Use Polymarket API for market data
- Create markets in our contract based on Polymarket
- Resolve using Polymarket's resolution

### Option 2: Hybrid Approach
- Use Polymarket for market discovery
- Create corresponding markets in our contract
- Users bet through our contract
- Resolve using Polymarket data

### Option 3: API-Only Integration
- Display Polymarket markets in our UI
- Link to Polymarket for actual betting
- Track creator rewards separately

## Next Steps

1. **Deploy contract to testnet**
2. **Create frontend hooks for contract interaction**
3. **Build "Create Market" UI**
4. **Test end-to-end flow**
5. **Deploy to mainnet**
6. **Add Polymarket integration (if time permits)**

## Hackathon Submission

For the hackathon, focus on:
- ✅ Working smart contract with creator incentives
- ✅ Frontend integration
- ✅ Base deployment
- ⏳ Polymarket integration (bonus if time permits)

The core value proposition: **"Create markets, earn 10% of all winnings"**

