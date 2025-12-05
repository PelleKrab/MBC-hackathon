import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  console.log("Check USDC Balance Script\n");

  // Get address from environment variable (set by wrapper) or command line
  let addressToCheck: string;
  
  if (process.env.CHECK_BALANCE_ADDRESS) {
    // Use environment variable (from npm script wrapper)
    addressToCheck = process.env.CHECK_BALANCE_ADDRESS;
  } else {
    // Fallback to command line arguments
    const allArgs = process.argv.slice(2);
    const args = allArgs.filter(arg => 
      !arg.includes('scripts/') && 
      arg !== '--network' && 
      arg !== 'baseSepolia' && 
      arg !== 'base'
    );
    
    if (args.length > 0) {
      addressToCheck = args[0];
    } else {
      // Use deployer address if no argument
      const [deployer] = await ethers.getSigners();
      addressToCheck = deployer.address;
      console.log("No address provided, checking deployer balance\n");
    }
  }
  
  if (addressToCheck && !ethers.isAddress(addressToCheck)) {
    console.error("❌ Invalid address");
    process.exit(1);
  }
  
  if (!addressToCheck) {
    // Use deployer address if no argument
    const [deployer] = await ethers.getSigners();
    addressToCheck = deployer.address;
    console.log("No address provided, checking deployer balance\n");
  }

  // Check if USDC address is in .env
  const usdcAddress = process.env.USDC_ADDRESS;
  
  if (!usdcAddress) {
    console.error("❌ USDC_ADDRESS not found in .env");
    console.log("Please add USDC_ADDRESS to your .env file");
    process.exit(1);
  }

  console.log("Checking balance for:", addressToCheck);
  console.log("USDC contract:", usdcAddress);
  console.log();

  // Get USDC contract
  const USDC = await ethers.getContractAt("MockUSDC", usdcAddress);
  
  // Get balance
  const balance = await USDC.balanceOf(addressToCheck);
  const decimals = await USDC.decimals();
  const balanceFormatted = ethers.formatUnits(balance, decimals);
  
  // Get token info
  const name = await USDC.name();
  const symbol = await USDC.symbol();
  
  console.log(`Token: ${name} (${symbol})`);
  console.log(`Balance: ${balanceFormatted} ${symbol}`);
  console.log(`Raw balance: ${balance.toString()}`);
  console.log(`Decimals: ${decimals}`);

  // Check if it's MockUSDC and show total supply
  try {
    const totalSupply = await USDC.totalSupply();
    const totalSupplyFormatted = ethers.formatUnits(totalSupply, decimals);
    console.log(`\nTotal Supply: ${totalSupplyFormatted} ${symbol}`);
  } catch {
    // Real USDC might not have totalSupply
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

