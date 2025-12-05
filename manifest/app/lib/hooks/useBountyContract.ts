"use client";

"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { BOUNTY_MARKET_ABI, getBountyContractAddress } from "../contracts";

/**
 * Hook to create a bounty market (can link to Polymarket)
 */
export function useCreateBountyMarket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createBountyMarket = async (
    polymarketId: string,
    question: string,
    deadline: number
  ) => {
    const chainId = baseSepolia.id; // TODO: Get from connected chain
    const contractAddress = getBountyContractAddress(chainId);

    writeContract({
      address: contractAddress,
      abi: BOUNTY_MARKET_ABI,
      functionName: "createBountyMarket",
      args: [polymarketId, question, BigInt(deadline)],
    });
  };

  return {
    createBountyMarket,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to contribute to bounty pool
 */
export function useContributeToBounty() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const contributeToBounty = async (marketId: number, amount: number) => {
    const chainId = baseSepolia.id;
    const contractAddress = getBountyContractAddress(chainId);
    const value = parseEther(amount.toString());

    writeContract({
      address: contractAddress,
      abi: BOUNTY_MARKET_ABI,
      functionName: "contributeToBounty",
      args: [BigInt(marketId)],
      value,
    });
  };

  return {
    contributeToBounty,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

