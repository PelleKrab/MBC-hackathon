# Deployment Troubleshooting

## Network Connection Issues

If you're getting `ECONNRESET` errors, try these solutions:

### Solution 1: Use Alternative RPC URL

Update your `.env` file with an alternative RPC provider:

```env
# Option 1: Alchemy (recommended)
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Option 2: Infura
BASE_SEPOLIA_RPC_URL=https://base-sepolia.infura.io/v3/YOUR_API_KEY

# Option 3: Public RPC (default, may be slow)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Option 4: QuickNode
BASE_SEPOLIA_RPC_URL=https://your-endpoint.base-sepolia.quiknode.pro/YOUR_KEY
```

### Solution 2: Get Free RPC API Keys

**Alchemy (Recommended):**
1. Go to https://www.alchemy.com/
2. Create free account
3. Create new app → Base Sepolia
4. Copy HTTP URL
5. Add to `.env` as `BASE_SEPOLIA_RPC_URL`

**Infura:**
1. Go to https://www.infura.io/
2. Create free account
3. Create new project → Base Sepolia
4. Copy endpoint URL
5. Add to `.env`

### Solution 3: Retry Deployment

The deploy script now has automatic retry logic. If it fails:
1. Wait a few seconds
2. Try again: `npm run deploy:sepolia`
3. Network issues are often temporary

### Solution 4: Check Network Connection

```bash
# Test RPC connection
curl https://sepolia.base.org

# Or test with ethers
node -e "const { ethers } = require('ethers'); ethers.getDefaultProvider('https://sepolia.base.org').getBlockNumber().then(console.log)"
```

### Solution 5: Use Different Network Temporarily

If Base Sepolia is having issues, you could:
1. Deploy to local Hardhat network first to test
2. Then deploy to Base Sepolia when network is stable

```bash
# Test on local network first
npx hardhat run scripts/deploy.ts
```

## Common Errors

### "Insufficient funds"
- Get more Base Sepolia ETH from faucet
- Check account balance

### "Nonce too high"
- Wait a few seconds and retry
- Or reset nonce in wallet

### "Network timeout"
- Use alternative RPC URL (Alchemy/Infura)
- Check internet connection
- Retry after a few minutes

## Recommended Setup

For reliable deployment, use Alchemy:

1. **Sign up for Alchemy** (free): https://www.alchemy.com/
2. **Create Base Sepolia app**
3. **Add to `.env`:**
   ```env
   BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
   ```
4. **Deploy:**
   ```bash
   npm run deploy:sepolia
   ```

This should resolve connection issues!

