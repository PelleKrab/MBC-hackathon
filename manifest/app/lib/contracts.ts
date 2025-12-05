import { Address } from "viem";
import { base, baseSepolia } from "viem/chains";

/**
 * Contract addresses (update after deployment)
 */
export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: "0x0000000000000000000000000000000000000000", // Update after deployment
  [base.id]: "0x0000000000000000000000000000000000000000", // Update after deployment
} as const;

/**
 * Contract ABI for PredictionMarket
 */
export const PREDICTION_MARKET_ABI = [
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
    ],
    name: "placePrediction",
    outputs: [],
    stateMutability: "payable",
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
          { internalType: "uint256", name: "timestampPool", type: "uint256" },
          { internalType: "uint256", name: "creatorPool", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "bool", name: "correctAnswer", type: "bool" },
          { internalType: "uint256", name: "actualTimestamp", type: "uint256" },
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
] as const;

/**
 * Get contract address for current chain
 */
export function getContractAddress(chainId: number): Address {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  return address as Address;
}

/**
 * Bounty Market Contract addresses
 */
export const BOUNTY_CONTRACT_ADDRESSES = {
  [baseSepolia.id]: "0x0000000000000000000000000000000000000000", // Update after deployment
  [base.id]: "0x0000000000000000000000000000000000000000", // Update after deployment
} as const;

/**
 * Bounty Market Contract ABI
 */
export const BOUNTY_MARKET_ABI = [
  {
    inputs: [
      { internalType: "string", name: "polymarketId", type: "string" },
      { internalType: "string", name: "question", type: "string" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "createBountyMarket",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "contributeToBounty",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "string", name: "proofHash", type: "string" },
    ],
    name: "submitProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Get bounty contract address for current chain
 */
export function getBountyContractAddress(chainId: number): Address {
  const address = BOUNTY_CONTRACT_ADDRESSES[chainId as keyof typeof BOUNTY_CONTRACT_ADDRESSES];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Bounty contract not deployed on chain ${chainId}`);
  }
  return address as Address;
}

