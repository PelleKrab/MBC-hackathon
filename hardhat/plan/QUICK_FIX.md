# Quick Fix Guide

## ✅ Script Arguments Fixed!

The scripts now work correctly:
```bash
npm run send-usdc <address> <amount>
npm run mint-usdc <address> <amount>
npm run check-balance [address]
```

## ⚠️ Current Issue: Need to Deploy Contracts First

The scripts need `USDC_ADDRESS` in your `.env` file. You need to deploy the contracts first.

### Step 1: Fix Network Connection (Recommended)

The public Base Sepolia RPC is unreliable. Use Alchemy:

1. **Sign up for Alchemy** (free): https://www.alchemy.com/
2. **Create Base Sepolia app**
3. **Add to `.env`:**
   ```env
   BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
   ```

### Step 2: Deploy Contracts

```bash
npm run deploy:sepolia
```

This will:
- Deploy MockUSDC
- Deploy PredictionMarket
- Output addresses to add to `.env`

### Step 3: Add Addresses to `.env`

After deployment, add:
```env
USDC_ADDRESS=<MockUSDC address from deployment>
PREDICTION_MARKET_ADDRESS=<PredictionMarket address from deployment>
```

### Step 4: Use the Scripts

Now you can:
```bash
# Send USDC
npm run send-usdc 0x294326B17d46643199d6EB9797996BdF7B536931 100000

# Mint USDC (MockUSDC only)
npm run mint-usdc 0x294326B17d46643199d6EB9797996BdF7B536931 100000

# Check balance
npm run check-balance 0x294326B17d46643199d6EB9797996BdF7B536931
```

## Alternative: Manual Deployment

If you've already deployed, just add the addresses to `.env`:
```env
USDC_ADDRESS=0x...
PREDICTION_MARKET_ADDRESS=0x...
```

