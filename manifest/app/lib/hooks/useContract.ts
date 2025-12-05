"use client";

/**
 * This file re-exports from useBountyContract for backwards compatibility.
 * The BountyMarket contract is now the primary contract.
 */

export { 
  useCreateBountyMarket as useCreateMarket,
  useContributeToBounty as usePlacePrediction,
  useVerifyProof as useVerifyBountyClaim,
  useResolveWithUMA as useResolveMarket,
} from "./useBountyContract";

// Re-export the market hooks from useMarkets
export { useMarket as useMarketContract } from "./useMarkets";
