# Deploy to Base Mainnet - Complete Guide (Using MockUSDC for Testing)

## Prerequisites

### 1. Base Mainnet ETH
- You need real ETH on Base mainnet for gas fees
- Get ETH from: https://bridge.base.org/
- Recommended: Have at least 0.1 ETH for deployment and initial operations

### 2. Environment Variables Setup

Create or update `hardhat/.env`:

```env
# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Base Mainnet RPC URL (required)
# Recommended providers:
# - Alchemy: https://www.alchemy.com/ (free tier: 300M compute units/month)
# - Infura: https://www.infura.io/ (free tier: 100k requests/day)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# BaseScan API Key (optional, for contract verification)
BASESCAN_API_KEY=your_basescan_api_key
```

### 3. Get RPC URL

**Option A: Alchemy (Recommended)**
1. Sign up at https://www.alchemy.com/
2. Create a new app
3. Select "Base" network
4. Copy the HTTP URL
5. Add to `.env` as `BASE_RPC_URL`

**Option B: Infura**
1. Sign up at https://www.infura.io/
2. Create a new project
3. Select "Base" network
4. Copy the endpoint URL
5. Add to `.env` as `BASE_RPC_URL`

## Deployment Steps

### Step 1: Compile Contracts

```bash
cd hardhat
npm run compile
```

This ensures all contracts compile without errors before deployment.

### Step 2: Deploy to Base Mainnet

```bash
npm run deploy:base
```

This will:
1. Connect to Base mainnet
2. **Deploy MockUSDC** (for testing - you can mint as much as needed)
3. Deploy PredictionMarket contract with MockUSDC address
4. Mint 10,000 MockUSDC to deployer for testing
5. Output contract addresses

**Expected Output:**
```
Deploying PredictionMarket contract with USDC...

Network: Base (Chain ID: 8453)
Current block: 12345678

Deploying with account: 0xYourAddress...
Account balance: 0.05 ETH

1. Deploying MockUSDC for testing...
   Sending deployment transaction...
   Waiting for confirmation (this may take 30-60 seconds)...
✓ MockUSDC deployed to: 0xMockUSDCAddress...

2. Minting 10,000 USDC to deployer for testing...
✓ Minted successfully

3. Deploying PredictionMarket with USDC...
   Sending deployment transaction...
   Waiting for confirmation (this may take 30-60 seconds)...
✓ PredictionMarket deployed

PredictionMarket deployed to: 0xYourContractAddress...

============================================================
DEPLOYMENT SUMMARY
============================================================
PredictionMarket: 0xYourContractAddress...
USDC Address: 0xMockUSDCAddress...
Admin: 0xYourAddress...
============================================================
```

### Step 3: Save Contract Addresses

Copy both addresses from the deployment output:
- `PredictionMarket` address
- `MockUSDC` address (USDC Address)

### Step 4: Update Environment Files

**Update `hardhat/.env`:**
```env
USDC_ADDRESS=0xMockUSDCAddress...
PREDICTION_MARKET_ADDRESS=0xYourContractAddress...
```

**Create or update `manifest/.env.local`:**
```env
# Base Mainnet Contract Addresses
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xYourContractAddress...
NEXT_PUBLIC_USDC_ADDRESS=0xMockUSDCAddress...

# OnChainKit API Key (if you have one)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_key
```

### Step 5: Mint More MockUSDC (Optional)

You can mint MockUSDC to any address for testing:

```bash
cd hardhat
npm run mint-usdc 0xRecipientAddress 10000
```

This mints 10,000 MockUSDC to the specified address.

### Step 6: Verify Contract (Optional but Recommended)

```bash
cd hardhat
npx hardhat verify --network base 0xYourContractAddress "0xMockUSDCAddress"
```

This makes your contract source code publicly verifiable on BaseScan.

### Step 7: Test the Deployment

1. **Start the frontend:**
   ```bash
   cd manifest
   npm run dev
   ```

2. **Connect your wallet:**
   - Make sure you're on Base mainnet
   - Connect your wallet
   - The app should automatically detect Base mainnet

3. **Get some MockUSDC:**
   - If you need more MockUSDC, use the mint script:
     ```bash
     cd hardhat
     npm run mint-usdc 0xYourWalletAddress 10000
     ```

4. **Test creating a market:**
   - Click "Create Market"
   - Fill in market details
   - Submit transaction
   - Check BaseScan for confirmation

5. **Test placing a prediction:**
   - Approve MockUSDC spending
   - Place a prediction
   - Check that pools update correctly

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] MockUSDC deployed successfully
- [ ] Contract addresses saved in both `.env` files
- [ ] Frontend updated with contract addresses
- [ ] Minted MockUSDC to test accounts
- [ ] Contract verified on BaseScan (optional)
- [ ] Tested market creation
- [ ] Tested placing a prediction
- [ ] Admin address set correctly (deployer is admin by default)

## Important Notes

### ⚠️ Security
- **NEVER commit `.env` files** to version control
- Use a hardware wallet or secure key management for mainnet
- The deployer address becomes the admin by default
- Consider transferring admin to a multisig wallet

### 💰 Costs
- **MockUSDC Deployment:** ~0.01-0.02 ETH
- **PredictionMarket Deployment:** ~0.01-0.05 ETH
- **Market Creation:** ~0.0001-0.001 ETH per market
- **Prediction:** ~0.0001-0.001 ETH per prediction
- **Resolution:** ~0.0001-0.001 ETH per resolution

### 🪙 MockUSDC vs Real USDC
- **MockUSDC** is deployed for testing - you can mint unlimited amounts
- This allows full testing without needing real USDC
- For production, you would use real USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- To switch to real USDC, just update the `USDC_ADDRESS` in your `.env` files

### 🔒 Admin Functions
The deployer address is set as admin and can:
- Verify bounty claims
- Resolve markets
- Transfer admin to another address (if implemented)

### 📊 Monitoring
- Watch your contract on BaseScan: `https://basescan.org/address/0xYourContractAddress`
- Watch MockUSDC on BaseScan: `https://basescan.org/address/0xMockUSDCAddress`
- Monitor gas usage
- Check for any errors or unexpected behavior

## Useful Commands

### Mint MockUSDC
```bash
cd hardhat
npm run mint-usdc <address> <amount>
# Example: npm run mint-usdc 0x1234... 10000
```

### Check Balance
```bash
cd hardhat
npm run check-balance <address>
```

### Send MockUSDC
```bash
cd hardhat
npm run send-usdc <recipient> <amount>
```

## Troubleshooting

### "Insufficient funds"
- Make sure you have enough ETH for gas fees
- Check your balance on BaseScan

### "Network connection error"
- Verify your RPC URL is correct
- Try using Alchemy or Infura
- Check if your API key has rate limits

### "Contract verification failed"
- Make sure you're using the correct constructor arguments
- Check that the contract is actually deployed
- Try verifying manually on BaseScan

### "Transaction failed"
- Check BaseScan for error details
- Ensure you have enough ETH for gas
- Verify contract address is correct

### "Cannot mint MockUSDC"
- Make sure you're using the MockUSDC address, not real USDC
- Check that the contract was deployed correctly
- Verify you're the owner of the MockUSDC contract

## Switching to Real USDC (Production)

When ready for production:

1. Update `manifest/.env.local`:
   ```env
   NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   ```

2. Users will need real USDC on Base mainnet
3. You can no longer mint USDC (real USDC is fixed supply)

## Next Steps

1. **Fund Initial Markets** (optional):
   - Add initial liquidity to markets
   - Seed some test markets with MockUSDC

2. **Set Up Monitoring**:
   - Set up alerts for contract events
   - Monitor gas usage
   - Track market activity

3. **User Onboarding**:
   - Share contract address
   - Provide user guide
   - Set up support channels

## Support

- BaseScan: https://basescan.org/
- Base Docs: https://docs.base.org/
- Base Discord: https://discord.gg/buildonbase
