import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  console.log("Mint Test USDC Script\n");

  // Get arguments from environment variables (set by wrapper) or command line
  let recipientAddress: string;
  let amount: number;
  
  if (process.env.MINT_USDC_RECIPIENT && process.env.MINT_USDC_AMOUNT) {
    // Use environment variables (from npm script wrapper)
    recipientAddress = process.env.MINT_USDC_RECIPIENT;
    amount = parseFloat(process.env.MINT_USDC_AMOUNT);
  } else {
    // Fallback to command line arguments
    const allArgs = process.argv.slice(2);
    const args = allArgs.filter(arg => 
      !arg.includes('scripts/') && 
      arg !== '--network' && 
      arg !== 'baseSepolia' && 
      arg !== 'base'
    );
    
    if (args.length < 2) {
      console.log("Usage: npm run mint-usdc <recipient_address> <amount>");
      console.log("Example: npm run mint-usdc 0x1234... 1000");
      process.exit(1);
    }
    
    recipientAddress = args[0];
    amount = parseFloat(args[1]);
  }

  if (!ethers.isAddress(recipientAddress)) {
    console.error("❌ Invalid recipient address");
    process.exit(1);
  }

  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Invalid amount");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Recipient address:", recipientAddress);
  console.log("Amount to mint:", amount, "USDC\n");

  // Check if USDC address is in .env
  const usdcAddress = process.env.USDC_ADDRESS;
  
  if (!usdcAddress) {
    console.error("❌ USDC_ADDRESS not found in .env");
    console.log("Please add USDC_ADDRESS to your .env file");
    console.log("This should be the MockUSDC address from deployment");
    process.exit(1);
  }

  console.log("Using MockUSDC at:", usdcAddress);

  // Get MockUSDC contract
  const MockUSDC = await ethers.getContractAt("MockUSDC", usdcAddress);
  
  // Check if it has mint function
  try {
    await MockUSDC.mint.staticCall(recipientAddress, 0);
  } catch {
    console.error("❌ Contract does not have mint function");
    console.log("This might be real USDC, not MockUSDC");
    console.log("Use sendTestUSDC.ts instead for transfers");
    process.exit(1);
  }

  // Get decimals
  const decimals = await MockUSDC.decimals();
  const amountInWei = ethers.parseUnits(amount.toString(), decimals);

  // Check current balance
  const currentBalance = await MockUSDC.balanceOf(recipientAddress);
  const currentBalanceFormatted = ethers.formatUnits(currentBalance, decimals);
  console.log(`Current recipient balance: ${currentBalanceFormatted} USDC`);

  // Mint USDC
  console.log(`\n💰 Minting ${amount} USDC to ${recipientAddress}...`);
  const mintTx = await MockUSDC.mint(recipientAddress, amountInWei);
  console.log("Transaction hash:", mintTx.hash);
  
  const receipt = await mintTx.wait();
  console.log("✓ Mint confirmed in block:", receipt?.blockNumber);

  // Check new balance
  const newBalance = await MockUSDC.balanceOf(recipientAddress);
  const newBalanceFormatted = ethers.formatUnits(newBalance, decimals);
  console.log(`\n✓ New recipient balance: ${newBalanceFormatted} USDC`);

  console.log("\n✅ Mint complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

