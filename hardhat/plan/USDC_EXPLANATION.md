# USDC Integration - Complete Explanation

## ✅ Yes, Markets Are Created On-Chain on Base!

When you call `createMarket()`, it creates a **real on-chain market** on Base blockchain. This is stored permanently in the contract's state.

## Why USDC Instead of ETH?

### Benefits:
1. **Stable Value** - USDC = $1, no price volatility
2. **Better UX** - Users think in dollars, not ETH
3. **Regulatory** - Easier compliance with stablecoins
4. **Professional** - Most DeFi uses stablecoins

### How It Works:

**Before (ETH):**
```solidity
// User sends ETH directly
function placePrediction(...) external payable {
    // msg.value contains ETH
}
```

**After (USDC):**
```solidity
// User approves USDC, then calls function
function placePrediction(..., uint256 amount) external {
    // Transfer USDC from user to contract
    usdc.safeTransferFrom(msg.sender, address(this), amount);
}
```

## User Flow with USDC

### 1. User Approves USDC (One-time or per transaction)
```typescript
// Frontend: User approves contract to spend USDC
await usdcContract.approve(contractAddress, amount);
```

### 2. User Places Prediction
```typescript
// Frontend: Place prediction with USDC amount
await contract.placePrediction(marketId, true, timestamp, amount);
// Contract automatically transfers USDC from user
```

### 3. Market Resolves
```typescript
// Contract distributes USDC to winners and bounty claimant
usdc.safeTransfer(winner, payoutAmount);
```

## USDC Addresses

### Base Sepolia (Testnet)
- **Mock USDC**: Deployed during contract deployment
- **Real USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (if available)

### Base Mainnet
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Contract Changes Summary

### What Changed:
1. ✅ Added `IERC20 usdc` - USDC token interface
2. ✅ Constructor now requires USDC address
3. ✅ `placePrediction()` - Takes `amount` instead of `payable`
4. ✅ All transfers use `usdc.safeTransfer()` instead of `call{value:}()`
5. ✅ Updated comments from ETH to USDC

### What Stayed the Same:
- ✅ Market creation (still on-chain)
- ✅ Pool distribution (90/10 split)
- ✅ Bounty system
- ✅ Resolution logic

## Frontend Updates Needed

### 1. Add USDC Contract
```typescript
// app/lib/contracts.ts
export const USDC_ADDRESS = {
  baseSepolia: "0x...", // Mock USDC from deployment
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
};

export const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];
```

### 2. Update Prediction Flow
```typescript
// Before placing prediction
const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

// Step 1: Approve
await usdcContract.approve(contractAddress, amount);

// Step 2: Place prediction
await contract.placePrediction(marketId, true, timestamp, amount);
```

### 3. Update Display
- Show USDC amounts (6 decimals)
- Display USDC balance
- Format as "$X.XX" instead of "X ETH"

## Testing

Tests need to:
1. Deploy MockUSDC
2. Approve USDC before predictions
3. Use 6 decimals (USDC) instead of 18 (ETH)

## Deployment

The deploy script now:
1. Deploys MockUSDC on testnet
2. Deploys PredictionMarket with USDC address
3. Mints test USDC to deployer

## Summary

✅ **Markets are created on-chain** - Every `createMarket()` call creates a real on-chain market  
✅ **USDC integration** - All transactions use USDC instead of ETH  
✅ **Better UX** - Stable value, dollar amounts  
✅ **Production ready** - Uses real USDC on mainnet

The contract is now ready for USDC-based prediction markets on Base! 🚀

