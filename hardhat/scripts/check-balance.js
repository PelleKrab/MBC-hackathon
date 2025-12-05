#!/usr/bin/env node

// Wrapper script to pass arguments to checkUSDCBalance.ts via environment variables
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

// Pass address via environment variable if provided
if (args.length > 0) {
  process.env.CHECK_BALANCE_ADDRESS = args[0];
}

const hardhatArgs = [
  'run',
  'scripts/checkUSDCBalance.ts',
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

