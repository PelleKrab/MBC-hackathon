# Contract Testing Setup Guide

## Step 1: Install Dependencies

```powershell
cd manifest
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers chai @types/chai
```

## Step 2: Verify Hardhat Installation

```powershell
npx hardhat --version
```

## Step 3: Compile the Contract

```powershell
npx hardhat compile
```

This will:
- Compile `PredictionMarket.sol`
- Generate TypeScript types in `typechain-types/`
- Check for compilation errors

## Step 4: Run Tests

```powershell
npx hardhat test
```

Or run with coverage:
```powershell
npx hardhat coverage
```

## Step 5: Run Specific Test File

```powershell
npx hardhat test contracts/test/PredictionMarket.test.ts
```

## Step 6: Run Tests with Verbose Output

```powershell
npx hardhat test --grep "Market Creation"
```

## Troubleshooting

### If compilation fails:
```powershell
# Clean and recompile
npx hardhat clean
npx hardhat compile
```

### If tests fail:
- Check that all dependencies are installed
- Verify Solidity version matches (0.8.20)
- Check that test file syntax is correct

## Next Steps After Tests Pass

1. **Deploy to Base Sepolia:**
   ```powershell
   npx hardhat run contracts/scripts/deploy.ts --network baseSepolia
   ```

2. **Update contract address** in `app/lib/contracts.ts`

3. **Test on frontend** with deployed contract

## Test Coverage

The test suite covers:
- ✅ Market creation
- ✅ Placing predictions (YES/NO)
- ✅ Pool distribution (90% prediction, 10% bounty)
- ✅ Bounty claim verification
- ✅ Market resolution
- ✅ Winner payout distribution
- ✅ Edge cases (no predictions, zero bets, etc.)

