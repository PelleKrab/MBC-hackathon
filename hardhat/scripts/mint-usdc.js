#!/usr/bin/env node

// Wrapper script to pass arguments to mintTestUSDC.ts via environment variables
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npm run mint-usdc <recipient_address> <amount>');
  console.log('Example: npm run mint-usdc 0x1234... 1000');
  process.exit(1);
}

// Pass arguments via environment variables
process.env.MINT_USDC_RECIPIENT = args[0];
process.env.MINT_USDC_AMOUNT = args[1];

// Determine network from environment or default to base (mainnet)
// You can override by setting NETWORK env var: NETWORK=baseSepolia npm run mint-usdc ...
const network = process.env.NETWORK || 'base';

const hardhatArgs = [
  'run',
  'scripts/mintTestUSDC.ts',
  '--network',
  network
];

const proc = spawn('npx', ['hardhat', ...hardhatArgs], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname + '/..',
  env: process.env
});

proc.on('exit', (code) => {
  process.exit(code || 0);
});

