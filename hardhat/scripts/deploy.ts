import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PredictionMarket contract with USDC...\n");
  console.log("Connecting to network...");
  
  // Test connection first with retries
  let connected = false;
  for (let i = 0; i < 3; i++) {
    try {
      const network = await ethers.provider.getNetwork();
      console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
      const blockNumber = await ethers.provider.getBlockNumber();
      console.log("Current block:", blockNumber);
      connected = true;
      break;
    } catch (error) {
      if (i === 2) {
        console.error("\n❌ Failed to connect to network after 3 attempts");
        console.error("\n💡 Try using a more reliable RPC provider:");
        console.error("   1. Alchemy: https://www.alchemy.com/ (free)");
        console.error("   2. Infura: https://www.infura.io/ (free)");
        console.error("   3. Add to .env: BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY");
        throw error;
      }
      console.log(`   Retry ${i + 1}/3...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy MockUSDC for testing (works on both testnet and mainnet)
  // This allows testing on mainnet without needing real USDC
  console.log("\n1. Deploying MockUSDC for testing...");
  let mockUSDC;
  let retries = 3;
  
  while (retries > 0) {
    try {
      const MockUSDC = await ethers.getContractFactory("MockUSDC");
      // Mint 1,000,000 USDC (6 decimals) = 1,000,000,000,000
      console.log("   Sending deployment transaction...");
      mockUSDC = await MockUSDC.deploy(ethers.parseUnits("1000000", 6));
      console.log("   Waiting for confirmation (this may take 30-60 seconds)...");
      await mockUSDC.waitForDeployment();
      console.log("✓ MockUSDC deployed");
      break;
    } catch (error: any) {
      retries--;
      if (retries === 0) {
        console.error("\n❌ Failed to deploy MockUSDC after retries");
        if (error.code === 'ECONNRESET' || error.message?.includes('ECONNRESET')) {
          console.error("\n💡 Network connection issue detected!");
          console.error("   Try using Alchemy RPC for more reliable connection:");
          console.error("   1. Sign up: https://www.alchemy.com/");
          console.error("   2. Create Base app");
          console.error("   3. Add to .env: BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY");
        }
        throw error;
      }
      console.log(`   Retry ${3 - retries}/3 (waiting 5 seconds)...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  }
  
  if (!mockUSDC) {
    throw new Error("Failed to deploy MockUSDC");
  }
  
  const usdcAddress = await mockUSDC.getAddress();
  console.log("MockUSDC address:", usdcAddress);
  
  // Give deployer some USDC for testing
  console.log("\n2. Minting 10,000 USDC to deployer for testing...");
  try {
    await mockUSDC!.mint(deployer.address, ethers.parseUnits("10000", 6));
    console.log("✓ Minted successfully");
  } catch (error) {
    console.log("⚠️  Mint failed, but deployment succeeded");
  }

  console.log("\n3. Deploying PredictionMarket with USDC...");
  let predictionMarket;
  let predictionRetries = 3;
  
    while (predictionRetries > 0) {
      try {
        const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
        console.log("   Sending deployment transaction...");
        predictionMarket = await PredictionMarketFactory.deploy(usdcAddress);
        console.log("   Waiting for confirmation (this may take 30-60 seconds)...");
        await predictionMarket.waitForDeployment();
        console.log("✓ PredictionMarket deployed");
        break;
      } catch (error: any) {
        predictionRetries--;
        if (predictionRetries === 0) {
          console.error("\n❌ Failed to deploy PredictionMarket after retries");
          if (error.code === 'ECONNRESET' || error.message?.includes('ECONNRESET')) {
            console.error("\n💡 Network connection issue detected!");
            console.error("   Try using Alchemy RPC for more reliable connection:");
            console.error("   1. Sign up: https://www.alchemy.com/");
            console.error("   2. Create Base app");
            console.error("   3. Add to .env: BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY");
          }
          throw error;
        }
        console.log(`   Retry ${3 - predictionRetries}/3 (waiting 5 seconds)...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    }

  const address = await predictionMarket.getAddress();
  console.log("PredictionMarket deployed to:", address);
  console.log("\nContract Configuration:");
  console.log("- USDC Address:", usdcAddress);
  console.log("- Admin:", deployer.address);
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("PredictionMarket:", address);
  console.log("USDC Address:", usdcAddress);
  console.log("Admin:", deployer.address);
  console.log("=".repeat(60));
  
  console.log("\n📝 IMPORTANT: Add to your .env file:");
  console.log(`USDC_ADDRESS=${usdcAddress}`);
  console.log(`PREDICTION_MARKET_ADDRESS=${address}`);
  
  console.log("\nNext steps:");
  console.log("1. Add USDC_ADDRESS to hardhat/.env file (for scripts):");
  console.log(`   USDC_ADDRESS=${usdcAddress}`);
  console.log("2. Update manifest/.env.local with:");
  console.log(`   NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${address}`);
  console.log(`   NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log("3. Mint MockUSDC to test accounts:");
  console.log(`   npm run mint-usdc <address> <amount>`);
  console.log("4. Verify contract on BaseScan:");
  const network = await ethers.provider.getNetwork();
  const networkName = network.chainId === 84532n ? "baseSepolia" : "base";
  console.log(`   npx hardhat verify --network ${networkName} ${address} "${usdcAddress}"`);
  
  console.log("\n💡 Quick test commands:");
  console.log(`   # Check your balance:`);
  console.log(`   npm run check-balance <address>`);
  console.log(`   # Send MockUSDC to someone:`);
  console.log(`   npm run send-usdc <address> <amount>`);
  console.log(`   # Mint more MockUSDC:`);
  console.log(`   npm run mint-usdc <address> <amount>`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
