# Deploy to Base Mainnet

## Prerequisites

1. **Base Mainnet ETH** for gas fees
   - You'll need real ETH on Base mainnet
   - Get from: https://bridge.base.org/

2. **Environment Variables**
   - `PRIVATE_KEY` - Your wallet private key
   - `BASE_RPC_URL` - Base mainnet RPC (recommend Alchemy)
   - `BASESCAN_API_KEY` - For contract verification (optional)

3. **USDC Address**
   - Base mainnet USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
   - This is already configured in the deployment script

## Deployment Steps

### Step 1: Set Up Environment

Create or update `hardhat/.env`:

```env
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
BASESCAN_API_KEY=your_basescan_api_key
```

**Recommended RPC Providers:**
- Alchemy: https://www.alchemy.com/ (free tier available)
- Infura: https://www.infura.io/ (free tier available)

### Step 2: Deploy Contracts

```bash
cd hardhat
npm run deploy:base
```

This will:
- Use real USDC on Base mainnet (no MockUSDC)
- Deploy PredictionMarket contract
- Output contract addresses

### Step 3: Update Frontend

After deployment, update `manifest/.env.local`:

```env
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=<deployed_address>
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### Step 4: Update App to Support Mainnet

The app currently defaults to Base Sepolia. Update `manifest/app/components/App.tsx`:

Change:
```typescript
chain={baseSepolia}
```

To support both networks, or change to:
```typescript
chain={base} // For mainnet only
```

### Step 5: Verify Contracts (Optional)

```bash
cd hardhat
npx hardhat verify --network base <PREDICTION_MARKET_ADDRESS> "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
```

## Important Notes

⚠️ **Mainnet Deployment Checklist:**
- [ ] Contracts tested on testnet
- [ ] All tests passing
- [ ] Security review completed
- [ ] Sufficient ETH for gas fees
- [ ] RPC URL configured
- [ ] Frontend updated with new addresses
- [ ] Admin address set correctly

💰 **Costs:**
- Deployment gas: ~0.01-0.05 ETH (varies with network conditions)
- Each transaction: ~0.0001-0.001 ETH

🔒 **Security:**
- Never commit `.env` file
- Use hardware wallet for mainnet deployments
- Verify contracts on BaseScan
- Test thoroughly on testnet first

## Post-Deployment

1. **Set Admin** (if needed):
   ```bash
   # Use a script or interact directly
   ```

2. **Fund Initial Markets** (optional):
   - Add initial liquidity to markets
   - Seed some test markets

3. **Monitor:**
   - Watch contract on BaseScan
   - Monitor gas usage
   - Check for any errors

## Rollback Plan

If issues occur:
1. Pause new market creation (if contract supports it)
2. Migrate to new contract if needed
3. Update frontend to point to new contract

