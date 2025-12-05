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

  // Check network
  const network = await ethers.provider.getNetwork();
  const isTestnet = network.chainId === 84532n; // Base Sepolia
  const isMainnet = network.chainId === 8453n; // Base mainnet

  // Note: We allow minting on mainnet if using MockUSDC
  // The script will check if the contract has a mint function

  // Check if USDC address is in .env
  let usdcAddress = process.env.USDC_ADDRESS;
  
  if (!usdcAddress) {
    console.error("❌ USDC_ADDRESS not found in .env");
    console.log("Please add USDC_ADDRESS to your .env file");
    console.log("This should be the MockUSDC address from deployment");
    console.log("\nTo get the address, check your deployment output or run:");
    console.log("  npm run deploy:sepolia");
    process.exit(1);
  }

  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  console.log("Using MockUSDC at:", usdcAddress);

  // Get MockUSDC contract
  let MockUSDC;
  try {
    MockUSDC = await ethers.getContractAt("MockUSDC", usdcAddress);
  } catch (error) {
    console.error("❌ Failed to connect to contract at", usdcAddress);
    console.log("This might not be a valid MockUSDC contract");
    console.log("Make sure you deployed MockUSDC and set USDC_ADDRESS correctly");
    process.exit(1);
  }
  
  // Check if it has mint function and is actually MockUSDC
  let hasMintFunction = false;
  try {
    await MockUSDC.mint.staticCall(recipientAddress, 0);
    hasMintFunction = true;
  } catch (error: any) {
    // Check if it's because the address is real USDC (no mint function)
    if (usdcAddress.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") {
      console.error("❌ This is the mainnet USDC address, not MockUSDC!");
      console.log("You're trying to use real USDC on testnet, which doesn't exist.");
      console.log("Please deploy MockUSDC first or use the correct MockUSDC address from deployment.");
    } else {
      console.error("❌ Contract does not have mint function");
      console.log("This might be real USDC, not MockUSDC");
      console.log("Make sure USDC_ADDRESS points to the MockUSDC contract from deployment");
    }
    process.exit(1);
  }

  // Get decimals - with better error handling
  let decimals: number;
  try {
    decimals = await MockUSDC.decimals();
  } catch (error: any) {
    console.error("❌ Failed to get decimals from contract");
    console.log("The contract at", usdcAddress, "might not be a valid ERC20 token");
    console.log("Error:", error.message);
    console.log("\nMake sure USDC_ADDRESS in .env points to the MockUSDC contract");
    process.exit(1);
  }
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

