"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { base } from "viem/chains";
import { useChainId, usePublicClient, useReadContract } from "wagmi";
import { getContractAddress, isContractConfigured, MarketStatus, PREDICTION_MARKET_ABI } from "../contracts";
import { Market } from "../types";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

/**
 * Hook to fetch all markets from the contract
 */
export function useMarkets() {
  const chainId = useChainId();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  // Use Base mainnet (Chain ID: 8453)
  // Get market counter from contract
  const { data: marketCounter, refetch: refetchCounter } = useReadContract({
    address: isContractConfigured() ? getContractAddress(base.id) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketCounter",
    query: {
      enabled: isContractConfigured(),
    },
  });

  const loadMarkets = useCallback(async () => {
    if (!isContractConfigured()) {
      setError("Contract not configured. Set NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS in .env");
      setIsLoading(false);
      return;
    }

    if (!publicClient) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const contractAddress = getContractAddress(base.id);
      const count = marketCounter ? Number(marketCounter) : 0;

      if (count === 0) {
        setMarkets([]);
        setIsLoading(false);
        return;
      }

      // Fetch all markets from contract
      const marketPromises = [];
      for (let i = 1; i <= count; i++) {
        marketPromises.push(
          publicClient.readContract({
            address: contractAddress,
            abi: PREDICTION_MARKET_ABI,
            functionName: "getMarket",
            args: [BigInt(i)],
          })
        );
      }

      const rawMarkets = await Promise.all(marketPromises);

      // Transform contract data to Market type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedMarkets: Market[] = rawMarkets.map((raw: any) => ({
        id: raw.id.toString(),
        question: raw.question,
        description: raw.description,
        creator: raw.creator,
        deadline: Number(raw.deadline) * 1000, // Convert to milliseconds
        resolutionDate: Number(raw.resolutionDate) * 1000,
        yesPool: parseFloat(formatUnits(raw.yesPool, USDC_DECIMALS)),
        noPool: parseFloat(formatUnits(raw.noPool, USDC_DECIMALS)),
        bountyPool: parseFloat(formatUnits(raw.bountyPool, USDC_DECIMALS)),
        status: mapContractStatus(raw.status),
        correctAnswer: raw.correctAnswer ? "yes" : "no",
        actualTimestamp: Number(raw.actualTimestamp) * 1000,
        bountyClaimant: raw.bountyClaimant !== "0x0000000000000000000000000000000000000000" 
          ? raw.bountyClaimant 
          : undefined,
        createdAt: Number(raw.createdAt) * 1000,
        contractMarketId: Number(raw.id),
        source: "base",
      }));

      // Sort by deadline (soonest first)
      const sortedMarkets = transformedMarkets.sort((a, b) => a.deadline - b.deadline);

      setMarkets(sortedMarkets);
    } catch (err) {
      console.error("Error loading markets:", err);
      setError(err instanceof Error ? err.message : "Failed to load markets");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, marketCounter]);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  // Refresh every 60 seconds (reduced frequency to avoid too many refreshes)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCounter();
      loadMarkets();
    }, 60000); // Changed from 30s to 60s
    return () => clearInterval(interval);
  }, [loadMarkets, refetchCounter]);

  const refetch = useCallback(() => {
    refetchCounter();
    loadMarkets();
  }, [refetchCounter, loadMarkets]);

  return { markets, isLoading, error, refetch };
}

/**
 * Hook to fetch a single market by ID
 */
export function useMarket(marketId: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const contractMarketId = parseInt(marketId, 10);
  const isValidId = !isNaN(contractMarketId) && contractMarketId > 0;

  // Use Base mainnet (Chain ID: 8453)
  const { data: rawMarket, isLoading: isContractLoading } = useReadContract({
    address: isContractConfigured() && isValidId ? getContractAddress(base.id) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getMarket",
    args: isValidId ? [BigInt(contractMarketId)] : undefined,
    query: {
      enabled: isContractConfigured() && isValidId,
    },
  });

  useEffect(() => {
    if (!isContractConfigured() || !isValidId) {
      setIsLoading(false);
      return;
    }

    if (isContractLoading) {
      setIsLoading(true);
      return;
    }

    if (rawMarket) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = rawMarket as any;
      setMarket({
        id: raw.id.toString(),
        question: raw.question,
        description: raw.description,
        creator: raw.creator,
        deadline: Number(raw.deadline) * 1000,
        resolutionDate: Number(raw.resolutionDate) * 1000,
        yesPool: parseFloat(formatUnits(raw.yesPool, USDC_DECIMALS)),
        noPool: parseFloat(formatUnits(raw.noPool, USDC_DECIMALS)),
        bountyPool: parseFloat(formatUnits(raw.bountyPool, USDC_DECIMALS)),
        status: mapContractStatus(raw.status),
        correctAnswer: raw.correctAnswer ? "yes" : "no",
        actualTimestamp: Number(raw.actualTimestamp) * 1000,
        bountyClaimant: raw.bountyClaimant !== "0x0000000000000000000000000000000000000000"
          ? raw.bountyClaimant
          : undefined,
        createdAt: Number(raw.createdAt) * 1000,
        contractMarketId: Number(raw.id),
        source: "base",
      });
    }
    setIsLoading(false);
  }, [rawMarket, isContractLoading, isValidId]);

  return { market, isLoading };
}

/**
 * Map contract status enum to Market status string
 */
function mapContractStatus(status: number): "active" | "closed" | "resolved" {
  switch (status) {
    case MarketStatus.Active:
      return "active";
    case MarketStatus.Closed:
      return "closed";
    case MarketStatus.Resolved:
      return "resolved";
    default:
      return "active";
  }
}
