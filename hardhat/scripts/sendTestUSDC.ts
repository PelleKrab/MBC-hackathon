import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  console.log("Test USDC Sender Script\n");

  // Get arguments from environment variables (set by wrapper) or command line
  let recipientAddress: string;
  let amount: number;
  
  if (process.env.SEND_USDC_RECIPIENT && process.env.SEND_USDC_AMOUNT) {
    // Use environment variables (from npm script wrapper)
    recipientAddress = process.env.SEND_USDC_RECIPIENT;
    amount = parseFloat(process.env.SEND_USDC_AMOUNT);
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
      console.log("Usage: npm run send-usdc <recipient_address> <amount>");
      console.log("Example: npm run send-usdc 0x1234... 100");
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
  console.log("Amount:", amount, "USDC\n");

  // Check if USDC address is in .env, otherwise use default MockUSDC
  const usdcAddress = process.env.USDC_ADDRESS;
  
  if (!usdcAddress) {
    console.error("❌ USDC_ADDRESS not found in .env");
    console.log("Please add USDC_ADDRESS to your .env file");
    console.log("Or deploy MockUSDC first and use its address");
    process.exit(1);
  }

  console.log("Using USDC at:", usdcAddress);

  // Get USDC contract
  const MockUSDC = await ethers.getContractAt("MockUSDC", usdcAddress);
  
  // Check if it's MockUSDC (has mint function) or real USDC
  let isMockUSDC = false;
  try {
    await MockUSDC.mint.staticCall(deployer.address, 0);
    isMockUSDC = true;
    console.log("✓ Detected MockUSDC (can mint)\n");
  } catch {
    console.log("✓ Detected real USDC (transfer only)\n");
  }

  // Check deployer balance
  const deployerBalance = await MockUSDC.balanceOf(deployer.address);
  const decimals = await MockUSDC.decimals();
  const deployerBalanceFormatted = ethers.formatUnits(deployerBalance, decimals);
  
  console.log(`Deployer balance: ${deployerBalanceFormatted} USDC`);

  // Calculate amount in wei (USDC uses 6 decimals)
  const amountInWei = ethers.parseUnits(amount.toString(), decimals);
  
  if (deployerBalance < amountInWei) {
    if (isMockUSDC) {
      console.log(`\n⚠️  Insufficient balance. Minting ${amount} USDC to deployer...`);
      const mintTx = await MockUSDC.mint(deployer.address, amountInWei);
      await mintTx.wait();
      console.log("✓ Minted successfully");
    } else {
      console.error(`\n❌ Insufficient balance. Need ${amount} USDC, have ${deployerBalanceFormatted} USDC`);
      console.log("Please get more USDC from a faucet or transfer from another account");
      process.exit(1);
    }
  }

  // Transfer USDC
  console.log(`\n📤 Transferring ${amount} USDC to ${recipientAddress}...`);
  const transferTx = await MockUSDC.transfer(recipientAddress, amountInWei);
  console.log("Transaction hash:", transferTx.hash);
  
  const receipt = await transferTx.wait();
  console.log("✓ Transfer confirmed in block:", receipt?.blockNumber);

  // Check recipient balance
  const recipientBalance = await MockUSDC.balanceOf(recipientAddress);
  const recipientBalanceFormatted = ethers.formatUnits(recipientBalance, decimals);
  console.log(`\n✓ Recipient balance: ${recipientBalanceFormatted} USDC`);

  console.log("\n✅ Transfer complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

