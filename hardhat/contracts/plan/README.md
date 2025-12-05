# Prediction Market Smart Contracts

## Overview

This directory contains the smart contracts for the Manifest Prediction Market platform on Base. The contracts implement a creator incentive mechanism where market creators receive 10% of all winnings.

## Pool Distribution

When a user places a prediction:
- **80%** → Goes to the prediction pool (YES or NO)
- **10%** → Goes to timestamp pool (winner-takes-all for closest guess)
- **10%** → Goes to market creator pool

When a market resolves:
- **Winners** → Share 80% pool proportionally based on their stake
- **Best Timestamp Guess** → Gets entire 10% timestamp pool
- **Market Creator** → Gets entire 10% creator pool

## Contract: PredictionMarket.sol

### Key Functions

#### `createMarket()`
Creates a new prediction market. The caller becomes the market creator and will receive 10% of all bets.

```solidity
function createMarket(
    string memory question,
    string memory description,
    uint256 deadline,
    uint256 resolutionDate
) external returns (uint256)
```

#### `placePrediction()`
Places a bet on a market. Automatically splits the bet: 80% to prediction pool, 10% to timestamp pool, 10% to creator pool.

```solidity
function placePrediction(
    uint256 marketId,
    bool prediction,  // true = YES, false = NO
    uint256 timestampGuess
) external payable
```

#### `resolveMarket()`
Resolves a market and distributes all winnings:
1. Pays creator their 10% pool
2. Pays best timestamp guesser their 10% pool
3. Distributes 80% pool proportionally to winners

```solidity
function resolveMarket(
    uint256 marketId,
    bool correctAnswer,
    uint256 actualTimestamp
) external
```

## Deployment

### Prerequisites
- Hardhat or Foundry
- Base Sepolia testnet ETH (for testing)
- Base mainnet ETH (for production)

### Using Hardhat

1. Install dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY]
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

## Integration with Frontend

The frontend should:
1. Connect to the deployed contract using Wagmi/Viem
2. Call `createMarket()` when users create markets
3. Call `placePrediction()` when users place bets
4. Call `resolveMarket()` when markets need to be resolved
5. Listen to events for real-time updates

## Security Considerations

- **Access Control**: Currently `resolveMarket()` can be called by anyone. Consider adding access control for production.
- **Reentrancy**: Uses `call()` for transfers. Consider using Checks-Effects-Interactions pattern.
- **Oracle**: Market resolution requires off-chain oracle or trusted resolver. Consider Chainlink oracles for production.

## Polymarket Integration

For Polymarket integration:
1. Use Polymarket's API to fetch market data
2. Create corresponding markets in this contract
3. Use Polymarket's resolution data to resolve markets
4. Distribute winnings through this contract's incentive mechanism

## Testing

Run tests with:
```bash
npx hardhat test
```

## License

MIT

