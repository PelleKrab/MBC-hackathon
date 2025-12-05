# Deployment Guide

## Prerequisites

1. **Base Sepolia ETH** for gas fees
   - Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Or use another Base Sepolia faucet

2. **Private Key** with testnet ETH
   - Export from MetaMask or your wallet
   - **NEVER commit this to git!**

3. **BaseScan API Key** (optional, for verification)
   - Get from: https://basescan.org/myapikey

## Step 1: Create .env File

Create a `.env` file in the `hardhat/` directory:

```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_optional
```

**Important:**
- Add `.env` to `.gitignore` (already done)
- Never share your private key
- Use a test account, not your main wallet

## Step 2: Compile Contract

```bash
npm run compile
```

This should create:
- `artifacts/` folder with compiled contracts
- `typechain-types/` folder with TypeScript types

## Step 3: Run Tests (Optional but Recommended)

```bash
npm run test
```

This verifies the contract works correctly before deployment.

## Step 4: Deploy to Base Sepolia

```bash
npm run deploy:sepolia
```

**Expected Output:**
```
Deploying PredictionMarket contract...
Deploying with account: 0xYourAddress...
Account balance: 1000000000000000000
PredictionMarket deployed to: 0xContractAddress...

Next steps:
1. Update CONTRACT_ADDRESSES in ../manifest/app/lib/contracts.ts
2. Verify contract on BaseScan:
   npx hardhat verify --network baseSepolia 0xContractAddress
3. Test contract functions
```

## Step 5: Verify Contract (Optional)

This makes your contract source code visible on BaseScan:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

## Step 6: Update Frontend

Update `manifest/app/lib/contracts.ts` with the deployed address:

```typescript
export const CONTRACT_ADDRESSES = {
  PredictionMarket: "0xYourDeployedAddress", // Update this!
};
```

## Step 7: Test on Frontend

1. Start the Next.js app:
   ```bash
   cd ../manifest
   npm run dev
   ```

2. Connect your wallet to Base Sepolia
3. Try creating a market
4. Place a test prediction

## Troubleshooting

### "Insufficient funds"
- Get more Base Sepolia ETH from faucet
- Check your account balance

### "Nonce too high"
- Wait a few seconds and try again
- Or reset your wallet's nonce

### "Contract verification failed"
- Make sure you're using the correct network
- Check that the contract address is correct
- Try with `--force` flag if needed

## Next Steps After Deployment

1. ✅ **Test Contract Functions**
   - Create a market
   - Place predictions
   - Submit proof (via frontend)
   - Verify bounty claim (as admin)
   - Resolve market

2. ✅ **Update Frontend**
   - Add contract address
   - Test all interactions
   - Verify events are emitted correctly

3. ✅ **Prepare for Demo**
   - Have testnet ETH ready
   - Prepare test scenarios
   - Document contract address

## Production Deployment (Base Mainnet)

When ready for production:

1. **Get Base Mainnet ETH** (real ETH!)
2. **Update .env** with mainnet RPC URL
3. **Deploy:**
   ```bash
   npm run deploy:base
   ```
4. **Verify on BaseScan**
5. **Update frontend** with mainnet address

**⚠️ Warning:** Mainnet deployment costs real ETH. Test thoroughly on testnet first!

