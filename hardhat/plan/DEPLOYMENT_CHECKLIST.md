# Deployment Checklist - Base Sepolia

## Pre-Deployment Checklist

- [x] ✅ Contract compiled successfully
- [x] ✅ All tests passing (15/15)
- [x] ✅ USDC integration working
- [ ] ⏳ `.env` file configured
- [ ] ⏳ Base Sepolia ETH for gas
- [ ] ⏳ Private key ready

## Deployment Steps

### 1. Create `.env` file (if not exists)

Create `hardhat/.env`:

```env
PRIVATE_KEY=your_private_key_without_0x
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=optional_for_verification
```

### 2. Get Base Sepolia ETH

You need ETH for gas fees:
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Or search "Base Sepolia faucet"

### 3. Deploy Contracts

```bash
npm run deploy:sepolia
```

**Expected Output:**
```
Deploying PredictionMarket contract with USDC...

1. Deploying MockUSDC for testing...
MockUSDC deployed to: 0xABC...
Minting 10,000 USDC to deployer for testing...

2. Deploying PredictionMarket with USDC...
PredictionMarket deployed to: 0xDEF...

============================================================
DEPLOYMENT SUMMARY
============================================================
PredictionMarket: 0xDEF...
USDC Address: 0xABC...
Admin: 0xYourAddress...
============================================================

📝 IMPORTANT: Add to your .env file:
USDC_ADDRESS=0xABC...
PREDICTION_MARKET_ADDRESS=0xDEF...
```

### 4. Update `.env` with addresses

Add the addresses from deployment output:

```env
USDC_ADDRESS=0xABC...
PREDICTION_MARKET_ADDRESS=0xDEF...
```

### 5. Update Frontend

Update `manifest/app/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  PredictionMarket: "0xDEF...", // From deployment
};

export const USDC_ADDRESS = {
  baseSepolia: "0xABC...", // From deployment
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Mainnet
};
```

### 6. Test Deployment

```bash
# Check your USDC balance
npm run check-balance

# Mint USDC to test accounts
npm run mint-usdc -- 0xTestAddress 1000

# Send USDC
npm run send-usdc -- 0xTestAddress 100
```

## Post-Deployment

- [ ] ✅ Contracts deployed
- [ ] ✅ Addresses added to `.env`
- [ ] ✅ Frontend updated
- [ ] ✅ Test USDC minted
- [ ] ✅ Contract verified (optional)

## Ready to Deploy?

Run: `npm run deploy:sepolia`

