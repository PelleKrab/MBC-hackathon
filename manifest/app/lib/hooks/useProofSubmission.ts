"use client";

import { useState } from "react";
import { ProofSubmissionInput } from "../types";
import { storage } from "../storage";

/**
 * Hook to submit proof
 * Note: In PredictionMarket, proofs are submitted off-chain and admin calls verifyBountyClaim
 */
export function useSubmitProof() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitProof = async (input: {
    marketId: string;
    submitterAddress: string;
    imageFile: File;
    timestamp: number;
    description?: string;
  }) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Upload image
      const formData = new FormData();
      formData.append("image", input.imageFile);

      const uploadResponse = await fetch("/api/proof/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await uploadResponse.json();

      // Store proof locally for admin to review
      // Admin will call verifyBountyClaim on the contract
      const proofInput: ProofSubmissionInput = {
        marketId: input.marketId,
        submitterAddress: input.submitterAddress,
        imageUrl: url,
        timestamp: input.timestamp,
      };

      const proof = storage.addProof(proofInput);
      
      setIsSuccess(true);
      setIsPending(false);
      return proof;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit proof";
      setError(errorMessage);
      setIsPending(false);
      throw err;
    }
  };

  return { submitProof, isPending, isSuccess, error };
}
