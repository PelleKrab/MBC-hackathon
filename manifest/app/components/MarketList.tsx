"use client";

import { useState } from "react";
import { Market } from "../lib/types";
import { MarketCard } from "./MarketCard";
import { PredictionModal } from "./PredictionModal";
import styles from "../styles/MarketList.module.css";

interface MarketListProps {
  markets: Market[];
  userAddress?: string;
  isLoading?: boolean;
  onPredictionSuccess: () => void;
}

export function MarketList({
  markets,
  userAddress,
  isLoading,
  onPredictionSuccess,
}: MarketListProps) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading markets...</p>
        </div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <p className={styles.emptyTitle}>No Active Markets</p>
          <p className={styles.emptyText}>
            Check back soon for new prediction markets!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.grid}>
          {markets.map((market, index) => (
            <MarketCard
              key={market.id}
              market={market}
              onPlaceBet={setSelectedMarket}
              index={index}
            />
          ))}
        </div>
      </div>

      {selectedMarket && (
        <PredictionModal
          market={selectedMarket}
          userAddress={userAddress}
          onClose={() => setSelectedMarket(null)}
          onSuccess={onPredictionSuccess}
        />
      )}
    </>
  );
}

