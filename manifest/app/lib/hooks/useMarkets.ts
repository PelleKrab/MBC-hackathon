"use client";

import { useState, useEffect, useCallback } from "react";
import { Market } from "../types";
import { storage } from "../storage";

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMarkets = useCallback(() => {
    storage.initializeSeedData();
    const allMarkets = storage.getMarkets();
    const activeMarkets = allMarkets
      .filter((m) => m.status === "active" && m.deadline > Date.now())
      .sort((a, b) => a.deadline - b.deadline);
    setMarkets(activeMarkets);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadMarkets();

    // Refresh every 30 seconds to update time remaining
    const interval = setInterval(loadMarkets, 30000);
    return () => clearInterval(interval);
  }, [loadMarkets]);

  const refetch = useCallback(() => {
    loadMarkets();
  }, [loadMarkets]);

  return { markets, isLoading, refetch };
}

export function useMarket(marketId: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMarket = () => {
      const m = storage.getMarket(marketId);
      setMarket(m);
      setIsLoading(false);
    };

    loadMarket();
  }, [marketId]);

  return { market, isLoading };
}

