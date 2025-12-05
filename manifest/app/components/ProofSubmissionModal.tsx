"use client";

import { useState, useRef } from "react";
import { Market } from "../lib/types";
import { TimestampPicker } from "./TimestampPicker";
import styles from "../styles/ProofSubmissionModal.module.css";

interface ProofSubmissionModalProps {
  market: Market;
  userAddress?: string;
  onClose: () => void;
  onSubmit: (data: {
    imageFile: File;
    timestamp: number;
    description?: string;
  }) => Promise<void>;
}

export function ProofSubmissionModal({
  market,
  userAddress,
  onClose,
  onSubmit,
}: ProofSubmissionModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setImageFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userAddress) {
      setError("Please connect your wallet first");
      return;
    }

    if (!imageFile) {
      setError("Please select an image as proof");
      return;
    }

    if (timestamp <= market.deadline) {
      setError("Event timestamp must be after the betting deadline");
      return;
    }

    if (timestamp > Date.now()) {
      setError("Event timestamp cannot be in the future");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        imageFile,
        timestamp,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Submit Proof</h2>
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
          <p className={styles.bountyInfo}>
            💰 Bounty: {market.bountyPool?.toFixed(4) || "0.0000"} ETH
          </p>
          <p className={styles.helpText}>
            Submit proof that you made this event happen. If verified, you&apos;ll
            receive 10% of all bets!
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <label className={styles.label} htmlFor="image">
              Proof Image *
            </label>
            <div className={styles.imageUpload}>
              {imagePreview ? (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Proof preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className={styles.removeImage}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  className={styles.uploadArea}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className={styles.uploadIcon}>📷</span>
                  <p className={styles.uploadText}>
                    Click to upload or drag and drop
                  </p>
                  <p className={styles.uploadHint}>
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className={styles.fileInput}
                required
              />
            </div>
          </div>

          <div className={styles.section}>
            <TimestampPicker
              minDate={market.deadline}
              maxDate={Date.now()}
              value={timestamp}
              onChange={setTimestamp}
              label="When did the event happen? *"
              helperText="Select the exact time when you made this event occur"
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="description">
              Additional Details (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Describe what happened, who was involved, etc."
              rows={4}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {!userAddress && (
            <div className={styles.warning}>
              Connect your wallet to submit proof
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
              disabled={!userAddress || isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Submitting..." : "Submit Proof"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

