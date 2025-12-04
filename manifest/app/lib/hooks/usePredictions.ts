"use client";

import { useState, useCallback } from "react";
import { Prediction, PredictionInput } from "../types";
import { storage } from "../storage";

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

export function useAddPrediction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPrediction = useCallback(async (input: PredictionInput) => {
    setIsPending(true);
    setError(null);

    try {
      const prediction = storage.addPrediction(input);
      setIsPending(false);
      return prediction;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add prediction");
      setIsPending(false);
      throw err;
    }
  }, []);

  return { addPrediction, isPending, error };
}

