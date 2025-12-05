# Quick Start: End-to-End Testing

## 🚀 3-Step Quick Start

### Step 1: Get Test USDC (30 seconds)

```bash
cd hardhat
npm run mint-usdc <YOUR_WALLET_ADDRESS> 10000
```

**Example:**
```bash
npm run mint-usdc 0x294326B17d46643199d6EB9797996BdF7B536931 10000
```

---

### Step 2: Start Frontend (10 seconds)

```bash
cd manifest
npm run dev
```

Open: **http://localhost:3000**

---

### Step 3: Test in Browser (5 minutes)

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Make sure you're on **Base Sepolia** (Chain ID: 84532)

2. **Create Market**
   - Click "Create Market"
   - Question: "Will it rain tomorrow?"
   - Deadline: Tomorrow
   - Resolution: Day after
   - Submit

3. **Place Prediction**
   - Click "Place Prediction" on your market
   - Choose Yes/No
   - Amount: 100 USDC
   - Set timestamp
   - **First time**: Approve USDC (separate transaction)
   - Then: Submit prediction

4. **Submit Proof** (after deadline)
   - Click "Submit Proof"
   - Upload image
   - Enter timestamp
   - Submit

5. **Verify & Resolve** (as admin)
   - Admin panel → Verify proof
   - Resolve market with correct answer

---

## ✅ That's It!

You've tested the full flow! Check `E2E_TESTING_GUIDE.md` for detailed scenarios.

---

## 🔧 Troubleshooting

**"Contract not deployed"**
- Check `manifest/.env.local` exists
- Restart dev server: `npm run dev`

**"Insufficient USDC"**
- Mint more: `npm run mint-usdc <address> <amount>`

**"Transaction failed"**
- Check you have Base Sepolia ETH for gas
- Verify network is Base Sepolia (84532)

---

## 📊 Contract Addresses

Already configured in `manifest/.env.local`:
- PredictionMarket: `0x3Bd01c693d4c4B2F378503dE480d0344a7090774`
- MockUSDC: `0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4`

