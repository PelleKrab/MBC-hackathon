# Quick Setup Commands

## Installation (Run in PowerShell)

```powershell
# Navigate to manifest directory
cd manifest

# Install Hardhat and testing dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers chai @types/chai

# Verify installation
npx hardhat --version
```

## Compile Contract

```powershell
npx hardhat compile
```

## Run Tests

```powershell
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test contracts/test/PredictionMarket.test.ts

# Run with verbose output
npx hardhat test --verbose
```

## Deploy (After Tests Pass)

```powershell
# Deploy to Base Sepolia testnet
npx hardhat run contracts/scripts/deploy.ts --network baseSepolia
```

## Environment Variables Needed

Create `.env` file in `manifest/` directory:

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key (optional, for verification)
```

## Quick Test Checklist

- [ ] Dependencies installed
- [ ] Contract compiles without errors
- [ ] Tests pass
- [ ] Contract deployed to testnet
- [ ] Contract address updated in frontend

