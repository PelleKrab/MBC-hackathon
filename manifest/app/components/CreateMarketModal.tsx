"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useCreateBountyMarket } from "../lib/hooks/useBountyContract";
import { isContractConfigured } from "../lib/contracts";
import { TimestampPicker } from "./TimestampPicker";
import { TransactionStatus } from "./TransactionStatus";
import styles from "../styles/CreateMarketModal.module.css";

interface CreateMarketModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMarketModal({ onClose, onSuccess }: CreateMarketModalProps) {
  const { address, isConnected } = useAccount();
  const { createBountyMarket, hash, isPending, isSuccess, error: txError } = useCreateBountyMarket();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const [error, setError] = useState("");

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      onClose();
    }
  }, [isSuccess, onSuccess, onClose]);

  // Handle transaction error
  useEffect(() => {
    if (txError) {
      setError(txError.message || "Transaction failed");
    }
  }, [txError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isContractConfigured()) {
      setError("Contract not configured. Set NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS in .env");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    if (deadline <= Date.now()) {
      setError("Deadline must be in the future");
      return;
    }

    // Auto-calculate resolution date as 1 day after deadline
    const resolutionDate = deadline + 24 * 60 * 60 * 1000; // 1 day after deadline

    try {
      await createBountyMarket(question, description, deadline, resolutionDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create market");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Create Prediction Market</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="question">
              Question *
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will Jesse get pied in the face at MBC?"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Market resolves YES if Jesse receives a pie to the face during MBC. Must be witnessed by at least 3 attendees."
              className={styles.textarea}
              rows={4}
              required
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Betting Deadline *</label>
            <TimestampPicker
              minDate={Date.now()}
              value={deadline}
              onChange={setDeadline}
              label=""
              helperText="When betting closes. Proof submissions can be made after this deadline."
            />
          </div>

          <div className={styles.infoBox}>
            <strong>💰 How it works:</strong>
            <ul>
              <li>Users bet USDC on YES or NO</li>
              <li>90% goes to prediction pools, 10% to bounty pool</li>
              <li>Winners split the losing pool proportionally</li>
              <li>Closest timestamp guess wins the bounty!</li>
            </ul>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#999" }}>
              🎯 Built on Base Sepolia
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {(isPending || isSuccess || txError) && (
            <TransactionStatus
              hash={hash}
              isPending={isPending}
              isSuccess={isSuccess}
              error={txError}
              label="Market Creation"
              onDismiss={() => {
                if (isSuccess) {
                  onClose();
                }
              }}
            />
          )}

          {!isConnected && (
            <div className={styles.warning}>
              Connect your wallet to create a market
            </div>
          )}

          {!isContractConfigured() && (
            <div className={styles.warning}>
              Contract not configured. Set NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS
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
              disabled={!isConnected || isPending || !isContractConfigured()}
              className={styles.submitButton}
            >
              {isPending ? "Creating..." : "Create Market"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
