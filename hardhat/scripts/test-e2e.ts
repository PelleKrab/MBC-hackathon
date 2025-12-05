import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Running End-to-End Test on Base Sepolia\n");

  const [signer] = await ethers.getSigners();
  console.log("📍 Using account:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 ETH Balance:", ethers.formatEther(balance), "ETH\n");

  // Contract addresses
  const PREDICTION_MARKET = "0x3Bd01c693d4c4B2F378503dE480d0344a7090774";
  const USDC_ADDRESS = "0xD4Da52fD216D3Aa892DE6EB91F6793eC7FcaCeE4";

  // Get contract instances
  const predictionMarket = await ethers.getContractAt("PredictionMarket", PREDICTION_MARKET);
  const mockUSDC = await ethers.getContractAt("MockUSDC", USDC_ADDRESS);

  // Check current state
  const marketCount = await predictionMarket.marketCounter();
  console.log("📊 Current market count:", marketCount.toString());

  // Check USDC balance
  const usdcBalance = await mockUSDC.balanceOf(signer.address);
  console.log("💵 USDC Balance:", ethers.formatUnits(usdcBalance, 6), "USDC\n");

  // ============================================
  // TEST 1: Create a Market
  // ============================================
  console.log("═══════════════════════════════════════");
  console.log("TEST 1: Creating a new market...");
  console.log("═══════════════════════════════════════");

  const now = Math.floor(Date.now() / 1000);
  const deadline = now + 3600; // 1 hour from now
  const resolutionDate = now + 7200; // 2 hours from now

  const question = "Will the test pass? 🧪";
  const description = "This market resolves YES if the end-to-end test completes successfully.";

  console.log("📝 Question:", question);
  console.log("⏰ Deadline:", new Date(deadline * 1000).toLocaleString());
  console.log("📅 Resolution:", new Date(resolutionDate * 1000).toLocaleString());

  try {
    const tx = await predictionMarket.createMarket(
      question,
      description,
      deadline,
      resolutionDate
    );
    console.log("📤 Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Market created! Gas used:", receipt?.gasUsed.toString());

    // Get the new market count
    const newMarketCount = await predictionMarket.marketCounter();
    console.log("📊 New market count:", newMarketCount.toString());

    // Get the market details
    const marketId = newMarketCount;
    const market = await predictionMarket.getMarket(marketId);
    console.log("\n📋 Market Details:");
    console.log("   ID:", market.id.toString());
    console.log("   Question:", market.question);
    console.log("   Creator:", market.creator);
    console.log("   Status:", market.status === 0n ? "Active" : "Closed");

    // ============================================
    // TEST 2: Mint USDC (if needed)
    // ============================================
    if (usdcBalance < ethers.parseUnits("100", 6)) {
      console.log("\n═══════════════════════════════════════");
      console.log("TEST 2: Minting test USDC...");
      console.log("═══════════════════════════════════════");

      const mintTx = await mockUSDC.mint(signer.address, ethers.parseUnits("1000", 6));
      await mintTx.wait();
      const newBalance = await mockUSDC.balanceOf(signer.address);
      console.log("✅ Minted! New USDC balance:", ethers.formatUnits(newBalance, 6), "USDC");
    }

    // ============================================
    // TEST 3: Place a Prediction
    // ============================================
    console.log("\n═══════════════════════════════════════");
    console.log("TEST 3: Placing a prediction...");
    console.log("═══════════════════════════════════════");

    const betAmount = ethers.parseUnits("10", 6); // 10 USDC
    const timestampGuess = now + 5400; // 1.5 hours from now

    // Approve USDC spending
    console.log("📝 Approving USDC spend...");
    const approveTx = await mockUSDC.approve(PREDICTION_MARKET, betAmount);
    await approveTx.wait();
    console.log("✅ Approved!");

    // Place prediction (YES = true)
    console.log("🎯 Placing YES prediction for 10 USDC...");
    const predictTx = await predictionMarket.placePrediction(
      marketId,
      true, // YES
      timestampGuess,
      betAmount
    );
    console.log("📤 Transaction sent:", predictTx.hash);
    
    const predictReceipt = await predictTx.wait();
    console.log("✅ Prediction placed! Gas used:", predictReceipt?.gasUsed.toString());

    // Check updated market
    const updatedMarket = await predictionMarket.getMarket(marketId);
    console.log("\n📋 Updated Market:");
    console.log("   YES Pool:", ethers.formatUnits(updatedMarket.yesPool, 6), "USDC");
    console.log("   NO Pool:", ethers.formatUnits(updatedMarket.noPool, 6), "USDC");
    console.log("   Bounty Pool:", ethers.formatUnits(updatedMarket.bountyPool, 6), "USDC");

    console.log("\n═══════════════════════════════════════");
    console.log("🎉 ALL TESTS PASSED!");
    console.log("═══════════════════════════════════════");
    console.log("\n🌐 Open http://localhost:3000 to see your market!");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    if (error.data) {
      console.error("   Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

