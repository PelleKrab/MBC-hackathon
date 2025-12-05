export interface Market {
  id: string;
  question: string;
  description: string;
  creator?: string; // Address of market creator
  deadline: number; // Unix timestamp when betting closes
  resolutionDate: number; // Expected resolution time
  yesPool: number;
  noPool: number;
  bountyPool?: number; // 10% of all bets - goes to person who made event happen
  status: "active" | "closed" | "resolved";
  correctAnswer?: "yes" | "no";
  actualTimestamp?: number;
  bountyClaimant?: string; // Address of person who made event happen
  createdAt: number;
  contractMarketId?: number; // If created on-chain (Base)
  polymarketId?: string; // Polymarket market ID if linked
  source?: "base" | "polymarket" | "hybrid"; // Market source
}

export interface Prediction {
  id: string;
  marketId: string;
  userAddress: string;
  prediction: "yes" | "no";
  amount: number;
  timestampGuess: number;
  createdAt: number;
}

export interface ProofSubmission {
  id: string;
  marketId: string;
  submitterAddress: string;
  imageUrl: string; // URL to uploaded image (IPFS, cloud storage, etc.)
  timestamp: number; // When the event happened (from submitter)
  submittedAt: number; // When proof was submitted
  status: "pending" | "approved" | "rejected";
  verifiedBy?: string; // Admin address who verified
  verifiedAt?: number;
}

export type PredictionInput = Omit<Prediction, "id" | "createdAt">;

export type ProofSubmissionInput = Omit<ProofSubmission, "id" | "submittedAt" | "status">;
