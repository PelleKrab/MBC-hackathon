"use client";

import { useState, useCallback } from "react";
import { Prediction, PredictionInput } from "../types";
import { storage } from "../storage";
import { useContributeToBounty } from "./useBountyContract";

/**
 * Hook to get local predictions cache
 * Note: Actual predictions are now on-chain via placePrediction
 */
export function usePredictions(marketId?: string) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPredictions = useCallback(() => {
    const allPredictions = storage.getPredictions(marketId);
    setPredictions(allPredictions);
    setIsLoading(false);
  }, [marketId]);

  return { predictions, isLoading, refetch: loadPredictions };
}

/**
 * Hook to add a prediction (places bet on-chain via USDC)
 */
export function useAddPrediction() {
  const { contributeToBounty, isPending, error: txError, isSuccess } = useContributeToBounty();
  const [error, setError] = useState<string | null>(null);

  const addPrediction = useCallback(async (input: PredictionInput) => {
    setError(null);

    try {
      // For PredictionMarket, we call placePrediction with all args
      const marketId = parseInt(input.marketId, 10);
      if (isNaN(marketId)) {
        throw new Error("Invalid market ID");
      }
      
      // contributeToBounty now takes (marketId, prediction, timestampGuess, amount)
      await contributeToBounty(
        marketId, 
        input.prediction === "yes",
        input.timestampGuess,
        input.amount
      );
      
      // Also store locally for UI tracking
      const prediction = storage.addPrediction(input);
      return prediction;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to add prediction";
      setError(errorMsg);
      throw err;
    }
  }, [contributeToBounty]);

  return { 
    addPrediction, 
    isPending, 
    isSuccess,
    error: error || (txError?.message ?? null)
  };
}
