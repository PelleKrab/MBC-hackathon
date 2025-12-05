# Hardhat Setup Commands

All Hardhat-related commands should be run from the `hardhat/` directory.

## Installation

```powershell
cd hardhat
npm install
```

## Compile Contract

```powershell
npm run compile
# or
npx hardhat compile
```

## Run Tests

```powershell
npm run test
# or
npx hardhat test
```

## Deploy to Base Sepolia

```powershell
npm run deploy:sepolia
# or
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Environment Variables

Create `.env` file in `hardhat/` directory:

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key (optional)
```

## Quick Test Checklist

- [ ] Navigate to `hardhat/` directory
- [ ] Run `npm install`
- [ ] Create `.env` file with your keys
- [ ] Run `npm run compile`
- [ ] Run `npm run test`
- [ ] Deploy with `npm run deploy:sepolia`
- [ ] Update contract address in `../app/lib/contracts.ts`

