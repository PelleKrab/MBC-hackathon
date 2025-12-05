"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreateMarket } from "../lib/hooks/useContract";
import { TimestampPicker } from "./TimestampPicker";
import styles from "../styles/CreateMarketModal.module.css";

interface CreateMarketModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMarketModal({ onClose, onSuccess }: CreateMarketModalProps) {
  const { address, isConnected } = useAccount();
  const { createMarket, isPending } = useCreateMarket();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const [resolutionDate, setResolutionDate] = useState(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    if (deadline <= Date.now()) {
      setError("Deadline must be in the future");
      return;
    }

    if (resolutionDate <= deadline) {
      setError("Resolution date must be after deadline");
      return;
    }

    try {
      // Create market on Base
      await createMarket(question, description, deadline, resolutionDate);
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create market");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Create Market</h2>
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
              placeholder="Market resolves YES if Jesse receives a pie to the face..."
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
              helperText="When betting closes"
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Expected Resolution Date *</label>
            <TimestampPicker
              minDate={deadline}
              value={resolutionDate}
              onChange={setResolutionDate}
              label=""
              helperText="When the event is expected to resolve"
            />
          </div>

          <div className={styles.infoBox}>
            <strong>💰 Bounty System:</strong>
            <ul>
              <li>10% of all bets go to bounty pool</li>
              <li>Rewards people who make events happen</li>
              <li>Submit proof with photo + timestamp</li>
              <li>Admin verifies and distributes bounty</li>
            </ul>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#999" }}>
              🎯 Built on Base • Compatible with Polymarket architecture
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {!isConnected && (
            <div className={styles.warning}>
              Connect your wallet to create a market
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
              disabled={!isConnected || isPending}
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

