"use client";

import { useState } from "react";
import { ProofSubmissionInput } from "../types";
import { storage } from "../storage";

export function useSubmitProof() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProof = async (input: {
    marketId: string;
    submitterAddress: string;
    imageFile: File;
    timestamp: number;
    description?: string;
  }) => {
    setIsPending(true);
    setError(null);

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

      // Create proof submission
      const proofInput: ProofSubmissionInput = {
        marketId: input.marketId,
        submitterAddress: input.submitterAddress,
        imageUrl: url,
        timestamp: input.timestamp,
      };

      const proof = storage.addProof(proofInput);

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

  return { submitProof, isPending, error };
}

