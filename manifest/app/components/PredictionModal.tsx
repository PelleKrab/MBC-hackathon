"use client";

import { useState, useEffect } from "react";
import { Market } from "../lib/types";
import { TimestampPicker } from "./TimestampPicker";
import { TransactionStatus } from "./TransactionStatus";
import { useContributeToBounty, useApproveUSDC, useUSDCBalance, useUSDCAllowance } from "../lib/hooks/useBountyContract";
import { isContractConfigured } from "../lib/contracts";
import { calculateOdds, calculatePotentialPayout } from "../lib/utils/calculations";
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
  const [timestampGuess, setTimestampGuess] = useState<number>(market.deadline + 24 * 60 * 60 * 1000);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"input" | "approve" | "confirm">("input");

  const { contributeToBounty, hash: betHash, isPending: isBetting, isSuccess: betSuccess, error: betError } = useContributeToBounty();
  const { approveUSDC, hash: approveHash, isPending: isApproving, isSuccess: approveSuccess, error: approveError } = useApproveUSDC();
  const { balance: usdcBalance, refetch: refetchBalance } = useUSDCBalance();
  const { allowance: usdcAllowance, refetch: refetchAllowance } = useUSDCAllowance();

  const amountNum = parseFloat(amount) || 0;
  const needsApproval = amountNum > usdcAllowance;
  const { yesOdds, noOdds } = calculateOdds(market);
  const potentialPayout = amountNum > 0 ? calculatePotentialPayout(market, prediction, amountNum) : 0;

  // Handle successful approval
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
      setStep("confirm");
    }
  }, [approveSuccess, refetchAllowance]);

  // Handle successful bet
  useEffect(() => {
    if (betSuccess) {
      refetchBalance();
      onSuccess();
      onClose();
    }
  }, [betSuccess, refetchBalance, onSuccess, onClose]);

  // Handle errors
  useEffect(() => {
    if (betError) {
      setError(betError.message || "Transaction failed");
    }
    if (approveError) {
      setError(approveError.message || "Approval failed");
    }
  }, [betError, approveError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userAddress) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isContractConfigured()) {
      setError("Contract not configured");
      return;
    }

    if (!market.contractMarketId) {
      setError("Invalid market ID");
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (amountNum > usdcBalance) {
      setError(`Insufficient USDC balance. You have ${usdcBalance.toFixed(2)} USDC`);
      return;
    }

    if (timestampGuess <= market.deadline) {
      setError("Timestamp guess must be after the betting deadline");
      return;
    }

    try {
      if (needsApproval) {
        setStep("approve");
        await approveUSDC(amountNum);
      } else {
        setStep("confirm");
        await contributeToBounty(
          market.contractMarketId, 
          prediction === "yes",
          timestampGuess,
          amountNum
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place prediction");
      setStep("input");
    }
  };

  const handleConfirmBet = async () => {
    if (!market.contractMarketId) return;
    
    try {
      await contributeToBounty(
        market.contractMarketId,
        prediction === "yes",
        timestampGuess,
        amountNum
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place prediction");
      setStep("input");
    }
  };

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
                YES ({yesOdds.toFixed(0)}%)
              </button>
              <button
                type="button"
                className={`${styles.predictionButton} ${
                  prediction === "no" ? styles.noActive : ""
                }`}
                onClick={() => setPrediction("no")}
              >
                <span className={styles.predictionIcon}>✕</span>
                NO ({noOdds.toFixed(0)}%)
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="amount">
              Amount (USDC)
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
            <p className={styles.balanceText}>
              Balance: {usdcBalance.toFixed(2)} USDC
            </p>
            {amountNum > 0 && (
              <div className={styles.breakdown}>
                <div className={styles.breakdownItem}>
                  <span>To {prediction.toUpperCase()} pool (90%):</span>
                  <span>{(amountNum * 0.9).toFixed(2)} USDC</span>
                </div>
                <div className={styles.breakdownItem}>
                  <span>To bounty pool (10%):</span>
                  <span>{(amountNum * 0.1).toFixed(2)} USDC</span>
                </div>
              </div>
            )}
          </div>

          <TimestampPicker
            minDate={market.deadline}
            maxDate={market.resolutionDate}
            value={timestampGuess}
            onChange={setTimestampGuess}
            label="When will it resolve?"
            helperText="Closest timestamp guess wins the 10% bounty pool!"
          />

          {potentialPayout > 0 && (
            <div className={styles.payoutInfo}>
              <span className={styles.payoutLabel}>Potential Payout</span>
              <span className={styles.payoutAmount}>
                {potentialPayout.toFixed(2)} USDC
              </span>
              <span className={styles.payoutSubtext}>
                if {prediction.toUpperCase()} wins
              </span>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <TransactionStatus
            hash={isApproving ? approveHash : betHash}
            isPending={isApproving || isBetting}
            isSuccess={approveSuccess || betSuccess}
            error={approveError || betError}
            label={isApproving ? "USDC Approval" : "Prediction"}
            onDismiss={() => {
              if (betSuccess) {
                onClose();
              }
            }}
          />

          {!userAddress && (
            <div className={styles.warning}>
              Connect your wallet to place a prediction
            </div>
          )}

          {needsApproval && amountNum > 0 && (
            <div className={styles.infoBox}>
              <p>⚠️ You need to approve USDC spending first</p>
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
            {step === "approve" ? (
              <button
                type="submit"
                disabled={!userAddress || isApproving}
                className={styles.submitButton}
              >
                {isApproving ? "Approving..." : "Approve USDC"}
              </button>
            ) : step === "confirm" ? (
              <button
                type="button"
                onClick={handleConfirmBet}
                disabled={!userAddress || isBetting}
                className={styles.submitButton}
              >
                {isBetting ? "Confirming..." : "Confirm Bet"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!userAddress || isBetting || isApproving || !isContractConfigured()}
                className={styles.submitButton}
              >
                {needsApproval ? "Approve & Bet" : "Place Prediction"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
