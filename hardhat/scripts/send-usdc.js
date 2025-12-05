#!/usr/bin/env node

// Wrapper script to pass arguments to sendTestUSDC.ts via environment variables
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npm run send-usdc <recipient_address> <amount>');
  console.log('Example: npm run send-usdc 0x1234... 100');
  process.exit(1);
}

// Pass arguments via environment variables
process.env.SEND_USDC_RECIPIENT = args[0];
process.env.SEND_USDC_AMOUNT = args[1];

const hardhatArgs = [
  'run',
  'scripts/sendTestUSDC.ts',
  '--network',
  'baseSepolia'
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

