# Prediction Market Contracts (Hardhat)

This folder contains the complete Hardhat project for the Prediction Market smart contracts.

## Structure

```
hardhat/
├── contracts/          # All Solidity contracts
│   ├── PredictionMarket.sol  # Main prediction market contract
│   ├── BountyMarket.sol      # Bounty-only contract (for Polymarket integration)
│   └── README.md             # Contract documentation
├── test/              # Test files
│   └── PredictionMarket.test.ts
├── scripts/           # Deployment scripts
│   └── deploy.ts
├── hardhat.config.ts  # Hardhat configuration
├── package.json       # Hardhat dependencies (isolated from Next.js app)
└── tsconfig.json      # TypeScript configuration
```

## Setup

1. **Install dependencies:**
   ```bash
   cd hardhat
   npm install
   ```

2. **Create `.env` file:**
   ```env
   PRIVATE_KEY=your_private_key_here
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASE_RPC_URL=https://mainnet.base.org
   BASESCAN_API_KEY=your_basescan_api_key (optional, for verification)
   ```

## Commands

### Compile
```bash
npm run compile
# or
npx hardhat compile
```

### Test
```bash
npm run test
# or
npx hardhat test
```

### Deploy
```bash
# Deploy to Base Sepolia testnet
npm run deploy:sepolia

# Deploy to Base mainnet
npm run deploy:base
```

### Verify Contract
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

## Contract Overview

### PredictionMarket.sol
Main contract that implements:
- Market creation
- Prediction placement (YES/NO)
- Pool distribution (90% to predictions, 10% to bounty)
- Bounty claim verification (admin-only)
- Market resolution and payout distribution

### BountyMarket.sol
Lightweight bounty contract for Polymarket integration:
- Bounty pool management
- Proof submission
- UMA oracle integration (optional)

## Testing

The test suite covers:
- ✅ Market creation
- ✅ Placing predictions (YES/NO)
- ✅ Pool distribution (90% prediction, 10% bounty)
- ✅ Bounty claim verification
- ✅ Market resolution
- ✅ Winner payout distribution
- ✅ Edge cases

## Notes

- This is a separate Hardhat project to avoid conflicts with the Next.js app in `manifest/`
- All Hardhat dependencies are isolated in this folder
- The main app can import contract ABIs from `artifacts/` after compilation
- Contract addresses should be updated in `../manifest/app/lib/contracts.ts` after deployment
