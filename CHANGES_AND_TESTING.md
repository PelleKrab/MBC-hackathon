# Changes Summary & Testing Guide

## 📋 What Changed

### 1. **Contracts Deployed to Base Sepolia** ✅
- **PredictionMarket Contract**: `0x3Bd01c693d4c4B2F378503dE480d0344a7090774`
- **MockUSDC Contract**: `0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4`
- Contracts are live and ready to use!

### 2. **USDC Integration** ✅
- Migrated from ETH to USDC for all transactions
- Using MockUSDC on Base Sepolia testnet
- All contract functions now use ERC20 tokens instead of native ETH

### 3. **File Organization** ✅
- All markdown documentation moved to `plan/` folders:
  - `plan/PLAN.md` (root)
  - `hardhat/plan/*.md` (17 files)
  - `hardhat/contracts/plan/*.md` (2 files)
  - `manifest/plan/*.md` (12 files)

### 4. **Utility Scripts** ✅
- `npm run send-usdc <address> <amount>` - Send USDC to any address
- `npm run mint-usdc <address> <amount>` - Mint USDC (MockUSDC only)
- `npm run check-balance [address]` - Check USDC balance

### 5. **Contract Features**
- ✅ Create prediction markets
- ✅ Place predictions with USDC
- ✅ Submit proof for bounty claims
- ✅ Admin verification of bounty claims
- ✅ Market resolution with automatic payouts
- ✅ Combined bounty/timestamp pool (10% of total bets)

---

## 🚀 How to Test

### Prerequisites
1. **Base Sepolia ETH** for gas fees
2. **USDC** (MockUSDC) for betting
3. **Wallet** connected to Base Sepolia network

---

## Step 1: Update Frontend Environment Variables

Create or update `manifest/.env.local`:

```env
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x3Bd01c693d4c4B2F378503dE480d0344a7090774
NEXT_PUBLIC_USDC_ADDRESS=0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4
```

---

## Step 2: Get Test USDC

### Option A: Mint USDC (if you're the deployer)
```bash
cd hardhat
npm run mint-usdc <YOUR_ADDRESS> 10000
```

### Option B: Request USDC from deployer
The deployer address has 1,000,000 USDC. You can request some via:
```bash
cd hardhat
npm run send-usdc <YOUR_ADDRESS> 10000
```

### Option C: Check your balance
```bash
cd hardhat
npm run check-balance <YOUR_ADDRESS>
```

---

## Step 3: Run the Frontend

```bash
cd manifest
npm install  # If not already installed
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Step 4: Test the Full Flow

### A. Create a Market
1. Connect your wallet (Base Sepolia)
2. Click "Create Market"
3. Fill in:
   - Question: "Will it rain tomorrow?"
   - Description: "Test market for hackathon"
   - Deadline: Tomorrow's date
   - Resolution Date: Day after tomorrow
4. Submit transaction

### B. Place a Prediction
1. Find your market in the list
2. Click "Place Prediction"
3. Choose Yes/No
4. Enter amount (e.g., 100 USDC)
5. Set timestamp guess
6. Approve USDC spending (first time)
7. Submit prediction

### C. Submit Proof (Bounty Claim)
1. After market deadline passes
2. Click "Submit Proof" on the market
3. Upload image proof
4. Enter timestamp when event happened
5. Add description
6. Submit

### D. Verify Bounty Claim (Admin Only)
1. Admin panel should show pending proofs
2. Review the proof
3. Click "Verify" to approve
4. This sets the bounty claimant and actual timestamp

### E. Resolve Market
1. Admin calls `resolveMarket` function
2. System automatically:
   - Distributes winnings to correct side
   - Pays bounty to verified claimant (if any)
   - Pays timestamp bonus to closest guess (if no bounty)

---

## 🧪 Contract Testing (Hardhat)

### Run Tests
```bash
cd hardhat
npm test
```

### Test Coverage
```bash
cd hardhat
npm run test:coverage
```

### Compile Contracts
```bash
cd hardhat
npm run compile
```

---

## 📊 Contract Functions

### Read Functions
- `getMarket(marketId)` - Get market details
- `getMarketPredictions(marketId)` - Get all predictions for a market
- `getUserPredictions(marketId, user)` - Get user's predictions
- `calculatePotentialPayout(marketId, prediction, amount)` - Calculate potential winnings

### Write Functions
- `createMarket(question, description, deadline, resolutionDate)` - Create new market
- `placePrediction(marketId, prediction, timestampGuess, amount)` - Place a bet
- `verifyBountyClaim(marketId, claimant, actualTimestamp)` - Admin: verify bounty
- `resolveMarket(marketId, correctAnswer, actualTimestamp)` - Admin: resolve market
- `setAdmin(newAdmin)` - Change admin (admin only)

---

## 🔍 Verify Contracts on BaseScan

```bash
cd hardhat
npx hardhat verify --network baseSepolia 0x3Bd01c693d4c4B2F378503dE480d0344a7090774 "0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4"
```

---

## 📝 Important Notes

1. **USDC Decimals**: MockUSDC uses 6 decimals (like real USDC)
   - 1 USDC = 1,000,000 (in smallest unit)
   - Use `ethers.parseUnits("100", 6)` for 100 USDC

2. **Pool Distribution**:
   - 90% goes to prediction pools (yes/no)
   - 10% goes to combined bounty/timestamp pool

3. **Bounty Priority**: If both bounty claimant and timestamp winner exist, bounty claimant gets the 10% pool

4. **Admin Functions**: Only the deployer (or set admin) can:
   - Verify bounty claims
   - Resolve markets
   - Change admin

---

## 🐛 Troubleshooting

### "Contract not deployed" error
- Check `.env.local` has correct addresses
- Restart dev server after updating env vars

### "Insufficient USDC balance"
- Mint or request USDC using the scripts
- Check balance: `npm run check-balance`

### "Transaction failed"
- Ensure you have Base Sepolia ETH for gas
- Check USDC approval (first transaction needs approval)
- Verify you're on Base Sepolia network

### Frontend not connecting
- Check wallet is on Base Sepolia (Chain ID: 84532)
- Verify contract addresses in `.env.local`
- Check browser console for errors

---

## 📚 Documentation

All documentation is now in `plan/` folders:
- `plan/PLAN.md` - Original project plan
- `hardhat/plan/` - Contract documentation
- `manifest/plan/` - Frontend and architecture docs

---

## ✅ Quick Test Checklist

- [ ] Frontend runs (`npm run dev`)
- [ ] Wallet connects to Base Sepolia
- [ ] USDC balance > 0
- [ ] Can create a market
- [ ] Can place a prediction
- [ ] Can submit proof (after deadline)
- [ ] Admin can verify bounty claim
- [ ] Admin can resolve market
- [ ] Winners receive payouts

---

## 🎯 Next Steps

1. Update frontend with contract addresses
2. Test full flow end-to-end
3. Deploy to production (Base mainnet) when ready
4. Update frontend to use real USDC on mainnet

---

## 📞 Contract Addresses (Base Sepolia)

```
PredictionMarket: 0x3Bd01c693d4c4B2F378503dE480d0344a7090774
MockUSDC:         0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4
```

View on BaseScan:
- PredictionMarket: https://sepolia.basescan.org/address/0x3Bd01c693d4c4B2F378503dE480d0344a7090774
- MockUSDC: https://sepolia.basescan.org/address/0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4

