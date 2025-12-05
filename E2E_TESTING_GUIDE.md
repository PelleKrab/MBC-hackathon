# End-to-End Testing Guide

## 🎯 Complete Testing Flow

This guide walks you through testing the entire prediction market system from start to finish.

---

## Prerequisites ✅

1. **Base Sepolia ETH** for gas fees
   - Get from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Or: https://bridge.base.org/deposit

2. **Test USDC** (MockUSDC) for betting
   - We'll mint this in Step 1

3. **Wallet** (Coinbase Wallet, MetaMask, etc.)
   - Must be connected to Base Sepolia (Chain ID: 84532)

---

## Step 1: Get Test USDC

Open a terminal and run:

```bash
cd hardhat

# Check your wallet address first
# Then mint 10,000 USDC to your address
npm run mint-usdc <YOUR_WALLET_ADDRESS> 10000
```

**Example:**
```bash
npm run mint-usdc 0x294326B17d46643199d6EB9797996BdF7B536931 10000
```

Verify your balance:
```bash
npm run check-balance <YOUR_WALLET_ADDRESS>
```

---

## Step 2: Start the Frontend

```bash
cd manifest
npm install  # If not already done
npm run dev
```

The app will open at: **http://localhost:3000**

---

## Step 3: Connect Your Wallet

1. Open http://localhost:3000 in your browser
2. Click "Connect Wallet" button
3. Select your wallet (Coinbase Wallet, MetaMask, etc.)
4. **IMPORTANT**: Make sure you're on **Base Sepolia** network
   - If not, switch network in your wallet
   - Chain ID: 84532
   - RPC URL: https://sepolia.base.org

---

## Step 4: Test Market Creation

### A. Create a Test Market

1. Click **"Create Market"** button
2. Fill in the form:
   - **Question**: "Will it rain in San Francisco tomorrow?"
   - **Description**: "Testing the prediction market system"
   - **Deadline**: Set to tomorrow (e.g., if today is Jan 15, set to Jan 16)
   - **Resolution Date**: Set to day after tomorrow (Jan 17)
3. Click **"Create Market"**
4. **Approve transaction** in your wallet
5. Wait for confirmation

**Expected Result:**
- Transaction succeeds
- New market appears in the market list
- Market shows as "Active"

---

## Step 5: Test Placing Predictions

### A. Place a "Yes" Prediction

1. Find your newly created market
2. Click **"Place Prediction"**
3. Fill in:
   - **Side**: Select "Yes"
   - **Amount**: Enter `100` (this is 100 USDC)
   - **Timestamp Guess**: Pick a time (e.g., tomorrow at 2:00 PM)
4. Click **"Place Prediction"**
5. **First time only**: Approve USDC spending
   - This is a separate transaction
   - Approve a large amount (e.g., 10,000) to avoid repeated approvals
6. **Then**: Confirm the prediction transaction

**Expected Result:**
- Transaction succeeds
- Market shows updated pool sizes
- Your prediction appears in the market

### B. Place a "No" Prediction (Optional)

1. Create another prediction on the same market
2. This time select **"No"**
3. Use a different amount (e.g., 50 USDC)
4. Submit

**Expected Result:**
- Both pools now have liquidity
- Odds update based on pool sizes

---

## Step 6: Test Proof Submission (Bounty Claim)

**Note**: This step requires the market deadline to have passed.

### Option A: Wait for Deadline
- Wait until the deadline time passes

### Option B: Create Market with Past Deadline (For Testing)
1. Create a new market with:
   - Deadline: Yesterday's date
   - Resolution Date: Today

### Submit Proof

1. Find a market where deadline has passed
2. Click **"Submit Proof"** button
3. Fill in:
   - **Upload Image**: Take/upload a screenshot or photo
   - **Timestamp**: Enter when the event happened
   - **Description**: "Proof that the event occurred"
4. Click **"Submit Proof"**

**Expected Result:**
- Proof is submitted (stored locally for now)
- Message confirms submission

---

## Step 7: Test Admin Verification (Bounty Claim)

**Note**: Only the deployer/admin can do this step.

### A. Access Admin Panel

1. The admin panel should be visible if you're the deployer
2. Or check the contract to see if your address is the admin:
   ```bash
   cd hardhat
   npx hardhat console --network baseSepolia
   # Then in console:
   const contract = await ethers.getContractAt("PredictionMarket", "0x3Bd01c693d4c4B2F378503dE480d0344a7090774")
   await contract.admin()
   ```

### B. Verify Bounty Claim

1. In the admin panel, find pending proof submissions
2. Review the proof (image, timestamp, description)
3. Click **"Verify"** button
4. Confirm transaction

**Expected Result:**
- Transaction succeeds
- Bounty claimant is set in the contract
- Proof status updates to "Verified"

---

## Step 8: Test Market Resolution

### A. Resolve the Market

1. As admin, click **"Resolve Market"** on a market
2. Fill in:
   - **Correct Answer**: Select Yes or No
   - **Actual Timestamp**: Enter the actual time the event occurred
3. Click **"Resolve Market"**
4. Confirm transaction

**Expected Result:**
- Transaction succeeds
- Market status changes to "Resolved"
- Winners receive payouts automatically
- Bounty claimant receives bounty (if verified)
- Closest timestamp guess receives bonus (if no bounty)

---

## Step 9: Verify Payouts

### Check Your Balance

```bash
cd hardhat
npm run check-balance <YOUR_WALLET_ADDRESS>
```

**Expected Result:**
- If you won: Your balance increased
- If you lost: Your balance decreased (you bet and lost)
- If you're bounty claimant: You received the 10% bounty pool

---

## 🧪 Complete Test Scenario

Here's a full scenario to test everything:

### Setup
1. **Wallet 1** (Admin): `0xf171c7A9dCdDA436b28451b53Cc1B541dE257b29`
2. **Wallet 2** (User): Your wallet address

### Test Flow

1. **Mint USDC to both wallets**
   ```bash
   npm run mint-usdc 0xf171c7A9dCdDA436b28451b53Cc1B541dE257b29 10000
   npm run mint-usdc <YOUR_ADDRESS> 10000
   ```

2. **Wallet 1 creates market**
   - Question: "Will the price of ETH be above $3000 tomorrow?"
   - Deadline: Tomorrow
   - Resolution: Day after

3. **Wallet 2 places "Yes" bet**
   - Amount: 100 USDC
   - Timestamp: Tomorrow 3:00 PM

4. **Wallet 1 places "No" bet**
   - Amount: 50 USDC
   - Timestamp: Tomorrow 4:00 PM

5. **Wait for deadline to pass**

6. **Wallet 2 submits proof**
   - Image: Screenshot
   - Timestamp: Tomorrow 3:15 PM
   - Description: "ETH price screenshot"

7. **Wallet 1 (admin) verifies proof**
   - Approves the bounty claim

8. **Wallet 1 resolves market**
   - Correct Answer: Yes
   - Actual Timestamp: Tomorrow 3:15 PM

9. **Verify payouts**
   - Wallet 2 should receive:
     - Winnings from "Yes" pool
     - Bounty (10% of total pool)
   - Wallet 1 should receive:
     - Nothing (lost the bet)

---

## 🔍 Debugging Tips

### Check Contract State

```bash
cd hardhat
npx hardhat console --network baseSepolia
```

Then:
```javascript
const contract = await ethers.getContractAt("PredictionMarket", "0x3Bd01c693d4c4B2F378503dE480d0344a7090774")
const market = await contract.getMarket(0) // First market
console.log(market)
```

### Check Market Predictions

```javascript
const predictions = await contract.getMarketPredictions(0)
console.log(predictions)
```

### Check User Balance

```javascript
const usdc = await ethers.getContractAt("MockUSDC", "0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4")
const balance = await usdc.balanceOf("<YOUR_ADDRESS>")
console.log(ethers.formatUnits(balance, 6))
```

### Check Events

View on BaseScan:
- https://sepolia.basescan.org/address/0x3Bd01c693d4c4B2F378503dE480d0344a7090774#events

---

## ✅ Testing Checklist

- [ ] Frontend loads without errors
- [ ] Wallet connects to Base Sepolia
- [ ] USDC balance shows correctly
- [ ] Can create a market
- [ ] Market appears in list
- [ ] Can place a "Yes" prediction
- [ ] Can place a "No" prediction
- [ ] USDC approval works
- [ ] Pool sizes update correctly
- [ ] Can submit proof (after deadline)
- [ ] Admin can verify bounty claim
- [ ] Admin can resolve market
- [ ] Winners receive payouts
- [ ] Bounty claimant receives bounty
- [ ] Market status updates correctly

---

## 🐛 Common Issues

### "Contract not deployed" error
- **Fix**: Check `.env.local` has correct addresses
- Restart dev server: `npm run dev`

### "Insufficient USDC balance"
- **Fix**: Mint more USDC: `npm run mint-usdc <address> <amount>`

### "Transaction failed"
- **Fix**: 
  - Check you have Base Sepolia ETH for gas
  - Verify you're on Base Sepolia network (Chain ID: 84532)
  - Check USDC approval (first transaction needs approval)

### "Network mismatch"
- **Fix**: Switch wallet to Base Sepolia network
- Add network if needed:
  - Network Name: Base Sepolia
  - RPC URL: https://sepolia.base.org
  - Chain ID: 84532
  - Currency Symbol: ETH

### Frontend not updating
- **Fix**: 
  - Hard refresh browser (Ctrl+Shift+R)
  - Check browser console for errors
  - Verify contract addresses in `.env.local`

---

## 📊 Expected Pool Distribution

When someone bets 100 USDC:
- **90 USDC** → Prediction pool (Yes or No)
- **10 USDC** → Combined bounty/timestamp pool

When market resolves:
- **Winners** get proportional share of 90% pool
- **Bounty claimant** OR **closest timestamp** gets 10% pool
- If both exist, bounty claimant takes priority

---

## 🎉 Success Criteria

Your E2E test is successful if:
1. ✅ Market created on-chain
2. ✅ Predictions placed and recorded
3. ✅ Proof submitted and verified
4. ✅ Market resolved correctly
5. ✅ All payouts distributed automatically
6. ✅ No funds stuck in contract
7. ✅ All events emitted correctly

---

## 📝 Next Steps After Testing

1. **Verify contracts on BaseScan** (optional)
2. **Test with multiple users**
3. **Test edge cases** (empty pools, no predictions, etc.)
4. **Deploy to Base mainnet** when ready
5. **Update to use real USDC** on mainnet

---

## 🔗 Useful Links

- **BaseScan (Sepolia)**: https://sepolia.basescan.org
- **Contract**: https://sepolia.basescan.org/address/0x3Bd01c693d4c4B2F378503dE480d0344a7090774
- **MockUSDC**: https://sepolia.basescan.org/address/0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

