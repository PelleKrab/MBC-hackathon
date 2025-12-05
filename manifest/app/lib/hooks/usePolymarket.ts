"use client";

import { useState, useEffect } from "react";
import {
  fetchPolymarketMarkets,
  getPolymarketMarket,
  getPolymarketPrices,
  isPolymarketResolved,
  type PolymarketMarket,
} from "../polymarket";

/**
 * Hook to fetch Polymarket markets
 */
export function usePolymarketMarkets(active: boolean = true) {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarkets() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPolymarketMarkets({ active, limit: 50 });
        setMarkets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load markets");
      } finally {
        setIsLoading(false);
      }
    }

    loadMarkets();
    // Refresh every 60 seconds
    const interval = setInterval(loadMarkets, 60000);
    return () => clearInterval(interval);
  }, [active]);

  return { markets, isLoading, error, refetch: () => fetchPolymarketMarkets({ active }) };
}

/**
 * Hook to get a single Polymarket market
 */
export function usePolymarketMarket(marketId: string | null) {
  const [market, setMarket] = useState<PolymarketMarket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) {
      setMarket(null);
      setIsLoading(false);
      return;
    }

    async function loadMarket() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPolymarketMarket(marketId!);
        setMarket(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load market");
      } finally {
        setIsLoading(false);
      }
    }

    loadMarket();
  }, [marketId]);

  return { market, isLoading, error };
}

/**
 * Hook to get Polymarket market prices
 */
export function usePolymarketPrices(marketId: string | null) {
  const [prices, setPrices] = useState<{ yesPrice: number; noPrice: number }>({
    yesPrice: 0.5,
    noPrice: 0.5,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!marketId) {
      setIsLoading(false);
      return;
    }

    async function loadPrices() {
      setIsLoading(true);
      try {
        const data = await getPolymarketPrices(marketId!);
        setPrices(data);
      } catch (err) {
        console.error("Failed to load prices:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPrices();
    // Refresh every 10 seconds
    const interval = setInterval(loadPrices, 10000);
    return () => clearInterval(interval);
  }, [marketId]);

  return { prices, isLoading };
}

/**
 * Hook to check if Polymarket market is resolved
 */
export function usePolymarketResolved(marketId: string | null) {
  const [isResolved, setIsResolved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!marketId) {
      setIsLoading(false);
      return;
    }

    async function checkResolved() {
      setIsLoading(true);
      try {
        const resolved = await isPolymarketResolved(marketId!);
        setIsResolved(resolved);
      } catch (err) {
        console.error("Failed to check resolution:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkResolved();
    // Check every 30 seconds
    const interval = setInterval(checkResolved, 30000);
    return () => clearInterval(interval);
  }, [marketId]);

  return { isResolved, isLoading };
}

