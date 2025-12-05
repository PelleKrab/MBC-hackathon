# Quick Deployment Guide

## ✅ Status: Ready to Deploy!

- ✅ Contract compiled
- ✅ All tests passing (15/15)
- ✅ USDC integration working
- ✅ Scripts ready

## Before Deploying

### 1. Create `.env` file

Create `hardhat/.env` with:

```env
PRIVATE_KEY=your_private_key_without_0x_prefix
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=optional
```

**⚠️ Important:**
- Use a test account, not your main wallet
- Never commit `.env` to git
- Private key should NOT have `0x` prefix

### 2. Get Base Sepolia ETH

You need ETH for gas fees:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Or search "Base Sepolia faucet"

## Deploy Now

```bash
npm run deploy:sepolia
```

This will:
1. Deploy MockUSDC
2. Deploy PredictionMarket
3. Mint 10,000 USDC to deployer
4. Show you all addresses

## After Deployment

1. **Add addresses to `.env`:**
   ```
   USDC_ADDRESS=0x...from_deployment
   PREDICTION_MARKET_ADDRESS=0x...from_deployment
   ```

2. **Update frontend** with addresses

3. **Test with scripts:**
   ```bash
   npm run check-balance
   npm run mint-usdc -- <address> <amount>
   ```

## Ready?

Make sure you have:
- [ ] `.env` file with PRIVATE_KEY
- [ ] Base Sepolia ETH for gas
- [ ] Network configured correctly

Then run: `npm run deploy:sepolia`

