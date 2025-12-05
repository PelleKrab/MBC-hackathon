# USDC Scripts Guide - Base Sepolia

Scripts for managing test USDC on Base Sepolia.

## Prerequisites

1. **Deploy MockUSDC first:**
   ```bash
   npm run deploy:sepolia
   ```
   This will deploy MockUSDC and PredictionMarket.

2. **Add to `.env` file:**
   ```env
   USDC_ADDRESS=0x...your_mock_usdc_address
   PRIVATE_KEY=your_private_key
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   ```

## Scripts

### 1. Send USDC (`sendTestUSDC.ts`)

Transfer USDC from your account to another address.

**Usage:**
```bash
npm run send-usdc -- <recipient_address> <amount>
```

**Example:**
```bash
# Send 100 USDC to an address
npm run send-usdc -- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 100

# Or directly with hardhat
npx hardhat run scripts/sendTestUSDC.ts --network baseSepolia -- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 100
```

**What it does:**
- Checks your balance
- If insufficient and it's MockUSDC, mints more to you
- Transfers USDC to recipient
- Shows recipient's new balance

---

### 2. Mint USDC (`mintTestUSDC.ts`)

Mint new USDC directly to an address (MockUSDC only).

**Usage:**
```bash
npm run mint-usdc -- <recipient_address> <amount>
```

**Example:**
```bash
# Mint 1000 USDC to an address
npm run mint-usdc -- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000

# Or directly
npx hardhat run scripts/mintTestUSDC.ts --network baseSepolia -- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000
```

**What it does:**
- Mints new USDC to recipient
- Shows old and new balance
- Only works with MockUSDC (not real USDC)

---

### 3. Check Balance (`checkUSDCBalance.ts`)

Check USDC balance of an address.

**Usage:**
```bash
# Check deployer balance (default)
npm run check-balance

# Check specific address
npm run check-balance -- <address>

# Or directly
npx hardhat run scripts/checkUSDCBalance.ts --network baseSepolia -- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**What it shows:**
- Token name and symbol
- Balance in human-readable format
- Raw balance (wei)
- Total supply (if MockUSDC)

---

## Quick Examples

### Setup for Testing

```bash
# 1. Deploy contracts
npm run deploy:sepolia

# 2. Note the MockUSDC address from output
# Add to .env: USDC_ADDRESS=0x...

# 3. Mint USDC to your test accounts
npm run mint-usdc -- 0xYourAddress1 1000
npm run mint-usdc -- 0xYourAddress2 1000

# 4. Check balances
npm run check-balance -- 0xYourAddress1
```

### Testing Prediction Market

```bash
# 1. Mint USDC to user who will place predictions
npm run mint-usdc -- 0xUserAddress 500

# 2. User approves contract (via frontend or script)
# 3. User places prediction (via frontend)

# 4. Check contract balance (should have USDC from bets)
npm run check-balance -- 0xContractAddress

# 5. After resolution, check winner balances
npm run check-balance -- 0xWinnerAddress
```

### Send to Multiple Addresses

```bash
# Send to multiple test accounts
npm run send-usdc -- 0xAddress1 100
npm run send-usdc -- 0xAddress2 100
npm run send-usdc -- 0xAddress3 100
```

---

## Troubleshooting

### "USDC_ADDRESS not found in .env"
- Add `USDC_ADDRESS=0x...` to your `.env` file
- Get address from deployment output

### "Insufficient balance"
- For MockUSDC: Script will auto-mint
- For real USDC: Get from faucet or transfer from another account

### "Contract does not have mint function"
- You're using real USDC, not MockUSDC
- Use `sendTestUSDC.ts` for transfers instead

### "Invalid address"
- Check address format (must start with 0x)
- Ensure address is valid Ethereum address

---

## Notes

- **MockUSDC uses 6 decimals** (like real USDC)
- **Amounts are in USDC** (not wei) - script handles conversion
- **Auto-minting**: `sendTestUSDC.ts` will mint if balance is insufficient (MockUSDC only)
- **Real USDC**: If using real USDC, you can only transfer, not mint

---

## Example Workflow

```bash
# 1. Deploy
npm run deploy:sepolia
# Output: MockUSDC deployed to: 0xABC...

# 2. Add to .env
echo "USDC_ADDRESS=0xABC..." >> .env

# 3. Mint to test accounts
npm run mint-usdc -- 0xTestAccount1 1000
npm run mint-usdc -- 0xTestAccount2 1000

# 4. Send to contract for testing
npm run send-usdc -- 0xContractAddress 100

# 5. Check balances
npm run check-balance -- 0xTestAccount1
npm run check-balance -- 0xContractAddress
```

---

## Integration with Frontend

After minting/sending USDC, users can:
1. Connect wallet in frontend
2. See USDC balance
3. Approve contract to spend USDC
4. Place predictions

The frontend should read USDC balance using:
```typescript
const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
const balance = await usdcContract.balanceOf(userAddress);
```

