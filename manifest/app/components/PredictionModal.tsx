"use client";

import { useState } from "react";
import { Market } from "../lib/types";
import { TimestampPicker } from "./TimestampPicker";
import { useAddPrediction } from "../lib/hooks/usePredictions";
import { calculatePotentialPayout } from "../lib/utils/calculations";
import styles from "../styles/PredictionModal.module.css";

interface PredictionModalProps {
  market: Market;
  userAddress?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PredictionModal({
  market,
  userAddress,
  onClose,
  onSuccess,
}: PredictionModalProps) {
  const [prediction, setPrediction] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState<string>("");
  const [timestampGuess, setTimestampGuess] = useState<number>(
    market.deadline + 24 * 60 * 60 * 1000
  );
  const [error, setError] = useState<string>("");

  const { addPrediction, isPending } = useAddPrediction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userAddress) {
      setError("Please connect your wallet first");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (timestampGuess <= market.deadline) {
      setError("Timestamp guess must be after the betting deadline");
      return;
    }

    try {
      await addPrediction({
        marketId: market.id,
        userAddress,
        prediction,
        amount: amountNum,
        timestampGuess,
      });

      onSuccess();
      onClose();
    } catch {
      setError("Failed to place prediction. Please try again.");
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const potentialPayout = amountNum > 0
    ? calculatePotentialPayout(market, prediction, amountNum)
    : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Place Prediction</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <div className={styles.marketInfo}>
          <p className={styles.marketQuestion}>{market.question}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <label className={styles.label}>Your Prediction</label>
            <div className={styles.predictionButtons}>
              <button
                type="button"
                className={`${styles.predictionButton} ${
                  prediction === "yes" ? styles.yesActive : ""
                }`}
                onClick={() => setPrediction("yes")}
              >
                <span className={styles.predictionIcon}>✓</span>
                YES
              </button>
              <button
                type="button"
                className={`${styles.predictionButton} ${
                  prediction === "no" ? styles.noActive : ""
                }`}
                onClick={() => setPrediction("no")}
              >
                <span className={styles.predictionIcon}>✕</span>
                NO
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="amount">
              Amount (ETH)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
              required
            />
            {amountNum > 0 && (
              <div className={styles.breakdown}>
                <div className={styles.breakdownItem}>
                  <span>To {prediction.toUpperCase()} pool (90%):</span>
                  <span>{(amountNum * 0.9).toFixed(4)} ETH</span>
                </div>
                <div className={styles.breakdownItem}>
                  <span>To timestamp pool (10%):</span>
                  <span>{(amountNum * 0.1).toFixed(4)} ETH</span>
                </div>
              </div>
            )}
          </div>

          <TimestampPicker
            minDate={market.deadline}
            maxDate={market.resolutionDate}
            value={timestampGuess}
            onChange={setTimestampGuess}
            helperText="Guess when the event will resolve. Closest guess wins 10% of total pool!"
          />

          {potentialPayout > 0 && (
            <div className={styles.payoutInfo}>
              <span className={styles.payoutLabel}>Potential Payout</span>
              <span className={styles.payoutAmount}>
                {potentialPayout.toFixed(4)} ETH
              </span>
              <span className={styles.payoutSubtext}>
                if {prediction.toUpperCase()} wins
              </span>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {!userAddress && (
            <div className={styles.warning}>
              Connect your wallet to place a prediction
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!userAddress || isPending}
              className={styles.submitButton}
            >
              {isPending ? "Processing..." : "Confirm Prediction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

