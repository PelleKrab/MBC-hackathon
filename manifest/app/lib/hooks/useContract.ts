"use client";

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useAccount } from "wagmi";
import { base, baseSepolia } from "viem/chains";
import { PREDICTION_MARKET_ABI, getContractAddress } from "../contracts";

/**
 * Hook to create a new prediction market
 */
export function useCreateMarket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = async (
    question: string,
    description: string,
    deadline: number,
    resolutionDate: number
  ) => {
    const chainId = baseSepolia.id; // TODO: Get from connected chain
    const contractAddress = getContractAddress(chainId);

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "createMarket",
      args: [question, description, BigInt(deadline), BigInt(resolutionDate)],
    });
  };

  return {
    createMarket,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to place a prediction
 */
export function usePlacePrediction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placePrediction = async (
    marketId: number,
    prediction: "yes" | "no",
    amount: number,
    timestampGuess: number
  ) => {
    const chainId = baseSepolia.id; // TODO: Get from connected chain
    const contractAddress = getContractAddress(chainId);
    const value = parseEther(amount.toString());

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "placePrediction",
      args: [
        BigInt(marketId),
        prediction === "yes",
        BigInt(timestampGuess),
      ],
      value,
    });
  };

  return {
    placePrediction,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to verify bounty claim (admin only)
 */
export function useVerifyBountyClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const verifyBountyClaim = async (params: {
    marketId: number;
    claimant: string;
    actualTimestamp: number;
  }) => {
    const chainId = baseSepolia.id; // TODO: Get from connected chain
    const contractAddress = getContractAddress(chainId);

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "verifyBountyClaim",
      args: [
        BigInt(params.marketId),
        params.claimant as Address,
        BigInt(params.actualTimestamp),
      ],
    });
  };

  return {
    verifyBountyClaim,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to resolve a market
 */
export function useResolveMarket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const resolveMarket = async (
    marketId: number,
    correctAnswer: "yes" | "no",
    actualTimestamp: number
  ) => {
    const chainId = baseSepolia.id; // TODO: Get from connected chain
    const contractAddress = getContractAddress(chainId);

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "resolveMarket",
      args: [
        BigInt(marketId),
        correctAnswer === "yes",
        BigInt(actualTimestamp),
      ],
    });
  };

  return {
    resolveMarket,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to read market data from contract
 */
export function useMarketContract(marketId: number | null) {
  const chainId = baseSepolia.id; // TODO: Get from connected chain
  const contractAddress = marketId ? getContractAddress(chainId) : undefined;

  const { data: marketData, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getMarket",
    args: marketId !== null ? [BigInt(marketId)] : undefined,
    query: {
      enabled: marketId !== null && contractAddress !== undefined,
    },
  });

  return {
    marketData: marketData
      ? {
          id: Number(marketData.id),
          question: marketData.question,
          description: marketData.description,
          creator: marketData.creator,
          deadline: Number(marketData.deadline),
          resolutionDate: Number(marketData.resolutionDate),
          yesPool: parseFloat(formatEther(marketData.yesPool)),
          noPool: parseFloat(formatEther(marketData.noPool)),
          timestampPool: parseFloat(formatEther(marketData.timestampPool)),
          creatorPool: parseFloat(formatEther(marketData.creatorPool)),
          status: marketData.status,
          correctAnswer: marketData.correctAnswer ? "yes" : "no",
          actualTimestamp: Number(marketData.actualTimestamp),
          createdAt: Number(marketData.createdAt),
        }
      : null,
    isLoading,
    error,
  };
}

/**
 * Hook to calculate potential payout
 */
export function useCalculatePayout(
  marketId: number | null,
  prediction: "yes" | "no" | null,
  amount: number | null
) {
  const chainId = baseSepolia.id; // TODO: Get from connected chain
  const contractAddress =
    marketId !== null && prediction !== null && amount !== null
      ? getContractAddress(chainId)
      : undefined;

  const { data: payout, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: PREDICTION_MARKET_ABI,
    functionName: "calculatePotentialPayout",
    args:
      marketId !== null && prediction !== null && amount !== null
        ? [
            BigInt(marketId),
            prediction === "yes",
            parseEther(amount.toString()),
          ]
        : undefined,
    query: {
      enabled:
        marketId !== null &&
        prediction !== null &&
        amount !== null &&
        amount > 0 &&
        contractAddress !== undefined,
    },
  });

  return {
    payout: payout ? parseFloat(formatEther(payout)) : null,
    isLoading,
    error,
  };
}

