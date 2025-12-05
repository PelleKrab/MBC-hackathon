import { Address } from "viem";
import { base, baseSepolia } from "viem/chains";

/**
 * Contract addresses - reads from env
 */
const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || "";
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || "";

export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: PREDICTION_MARKET_ADDRESS || "0x0000000000000000000000000000000000000000",
  [base.id]: PREDICTION_MARKET_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

export const USDC_ADDRESSES = {
  [baseSepolia.id]: USDC_ADDRESS || "0x0000000000000000000000000000000000000000",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base mainnet USDC
} as const;

/**
 * PredictionMarket Contract ABI - matches hardhat/contracts/PredictionMarket.sol
 */
export const PREDICTION_MARKET_ABI = [
  // Read functions
  {
    inputs: [],
    name: "marketCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "usdc",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "question", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "resolutionDate", type: "uint256" },
          { internalType: "uint256", name: "yesPool", type: "uint256" },
          { internalType: "uint256", name: "noPool", type: "uint256" },
          { internalType: "uint256", name: "bountyPool", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "bool", name: "correctAnswer", type: "bool" },
          { internalType: "uint256", name: "actualTimestamp", type: "uint256" },
          { internalType: "address", name: "bountyClaimant", type: "address" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct PredictionMarket.Market",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "getMarketPredictions",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "marketId", type: "uint256" },
          { internalType: "address", name: "user", type: "address" },
          { internalType: "bool", name: "prediction", type: "bool" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestampGuess", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct PredictionMarket.Prediction[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserPredictions",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "marketId", type: "uint256" },
          { internalType: "address", name: "user", type: "address" },
          { internalType: "bool", name: "prediction", type: "bool" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestampGuess", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct PredictionMarket.Prediction[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "bool", name: "prediction", type: "bool" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "calculatePotentialPayout",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { internalType: "string", name: "question", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint256", name: "resolutionDate", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "bool", name: "prediction", type: "bool" },
      { internalType: "uint256", name: "timestampGuess", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "placePrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "address", name: "claimant", type: "address" },
      { internalType: "uint256", name: "actualTimestamp", type: "uint256" },
    ],
    name: "verifyBountyClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "bool", name: "correctAnswer", type: "bool" },
      { internalType: "uint256", name: "actualTimestamp", type: "uint256" },
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newAdmin", type: "address" }],
    name: "setAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "question", type: "string" },
      { indexed: false, internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "predictionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "bool", name: "prediction", type: "bool" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "timestampGuess", type: "uint256" },
    ],
    name: "PredictionPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: false, internalType: "bool", name: "correctAnswer", type: "bool" },
      { indexed: false, internalType: "uint256", name: "actualTimestamp", type: "uint256" },
    ],
    name: "MarketResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "claimant", type: "address" },
      { indexed: false, internalType: "uint256", name: "actualTimestamp", type: "uint256" },
    ],
    name: "BountyClaimVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "string", name: "reason", type: "string" },
    ],
    name: "WinningsDistributed",
    type: "event",
  },
] as const;

/**
 * ERC20 (USDC) ABI - minimal for approve and balanceOf
 */
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Market status enum matching the contract
 */
export enum MarketStatus {
  Active = 0,
  Closed = 1,
  Resolved = 2,
}

/**
 * Get contract address for current chain
 */
export function getContractAddress(chainId: number): Address {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract not deployed on chain ${chainId}. Set NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS in .env`);
  }
  return address as Address;
}

/**
 * Get USDC address for current chain
 */
export function getUSDCAddress(chainId: number): Address {
  const address = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`USDC address not configured for chain ${chainId}. Set NEXT_PUBLIC_USDC_ADDRESS in .env`);
  }
  return address as Address;
}

/**
 * Check if contract is configured
 */
export function isContractConfigured(): boolean {
  return !!PREDICTION_MARKET_ADDRESS && PREDICTION_MARKET_ADDRESS !== "0x0000000000000000000000000000000000000000";
}

// Legacy exports for backwards compatibility
export const BOUNTY_MARKET_ABI = PREDICTION_MARKET_ABI;
export const BOUNTY_CONTRACT_ADDRESSES = CONTRACT_ADDRESSES;
export const getBountyContractAddress = getContractAddress;
