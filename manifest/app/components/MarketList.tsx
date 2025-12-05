"use client";

import { useState } from "react";
import { Market } from "../lib/types";
import { MarketCard } from "./MarketCard";
import { PredictionModal } from "./PredictionModal";
import { ProofSubmissionModal } from "./ProofSubmissionModal";
import { useSubmitProof } from "../lib/hooks/useProofSubmission";
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
  const [proofMarket, setProofMarket] = useState<Market | null>(null);
  const { submitProof } = useSubmitProof();

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
              onSubmitProof={setProofMarket}
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

      {proofMarket && userAddress && (
        <ProofSubmissionModal
          market={proofMarket}
          userAddress={userAddress}
          onClose={() => setProofMarket(null)}
          onSubmit={async (data) => {
            await submitProof({
              marketId: proofMarket.id,
              submitterAddress: userAddress,
              imageFile: data.imageFile,
              timestamp: data.timestamp,
              description: data.description,
            });
            setProofMarket(null);
            onPredictionSuccess(); // Refresh markets
          }}
        />
      )}
    </>
  );
}

