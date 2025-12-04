export interface Market {
  id: string;
  question: string;
  description: string;
  deadline: number; // Unix timestamp when betting closes
  resolutionDate: number; // Expected resolution time
  yesPool: number;
  noPool: number;
  timestampPool: number; // 10% of all bets
  status: "active" | "closed" | "resolved";
  correctAnswer?: "yes" | "no";
  actualTimestamp?: number;
  createdAt: number;
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

export type PredictionInput = Omit<Prediction, "id" | "createdAt">;

