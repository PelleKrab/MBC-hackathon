# USDC Migration Guide

## Changes Made

The contract has been updated to use **USDC** instead of native ETH for all transactions.

## Key Changes

### 1. Contract Updates
- ✅ Uses OpenZeppelin's `SafeERC20` for safe token transfers
- ✅ Requires USDC address in constructor
- ✅ `placePrediction()` now takes `amount` parameter instead of `payable`
- ✅ All transfers use `usdc.safeTransfer()` and `usdc.safeTransferFrom()`
- ✅ Updated comments from ETH to USDC

### 2. User Flow Changes

**Before (ETH):**
```solidity
// User sends ETH directly
placePrediction(marketId, true, timestamp, { value: ethers.parseEther("1.0") })
```

**After (USDC):**
```solidity
// User must approve first, then call
usdc.approve(contractAddress, amount)
placePrediction(marketId, true, timestamp, amount)
```

### 3. USDC Addresses

**Base Sepolia (Testnet):**
- Mock USDC: Deploy `MockUSDC.sol` for testing
- Real USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (if available)

**Base Mainnet:**
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Deployment Steps

### 1. Deploy Mock USDC (for testing)
```bash
# Deploy MockUSDC first
npx hardhat run scripts/deployMockUSDC.ts --network baseSepolia
```

### 2. Deploy PredictionMarket with USDC address
```bash
# Update deploy.ts with USDC address
npm run deploy:sepolia
```

## Frontend Changes Needed

### 1. Update Contract Interaction
```typescript
// Before
await contract.placePrediction(marketId, true, timestamp, {
  value: ethers.parseEther("1.0")
});

// After
// Step 1: Approve USDC
await usdcContract.approve(contractAddress, amount);
// Step 2: Place prediction
await contract.placePrediction(marketId, true, timestamp, amount);
```

### 2. Update Hooks
- `useContract.ts` - Update `placePrediction` to handle approval
- `calculations.ts` - Update to use USDC decimals (6 instead of 18)

### 3. Update UI
- Show USDC amounts instead of ETH
- Add approval step before placing predictions
- Display USDC balance

## Benefits of USDC

1. ✅ **Stable value** - No ETH price volatility
2. ✅ **Better UX** - Users understand dollar amounts
3. ✅ **Regulatory** - Easier compliance with stablecoins
4. ✅ **Cross-chain** - USDC available on many chains

## Testing

Tests need to be updated to:
1. Deploy MockUSDC
2. Approve USDC before placing predictions
3. Use USDC amounts (6 decimals) instead of ETH (18 decimals)

