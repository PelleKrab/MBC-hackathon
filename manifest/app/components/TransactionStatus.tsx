"use client";

import { useEffect, useState } from "react";
import styles from "../styles/TransactionStatus.module.css";

interface TransactionStatusProps {
  hash?: `0x${string}`;
  isPending?: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  label?: string;
  onDismiss?: () => void;
}

export function TransactionStatus({
  hash,
  isPending,
  isSuccess,
  error,
  label = "Transaction",
  onDismiss,
}: TransactionStatusProps) {
  const [show, setShow] = useState(false);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

  // Show notification when transaction starts
  useEffect(() => {
    if (isPending || isSuccess || error) {
      setShow(true);
    }
  }, [isPending, isSuccess, error]);

  // Auto-dismiss success after 5 seconds
  useEffect(() => {
    if (isSuccess && !isPending && !hasShownSuccess) {
      setHasShownSuccess(true);
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isPending, hasShownSuccess, onDismiss]);

  // Reset when new transaction starts (new hash)
  useEffect(() => {
    if (hash && isPending) {
      setHasShownSuccess(false);
    }
  }, [hash, isPending]);

  // Hide if no active transaction and not showing success
  useEffect(() => {
    if (!isPending && !isSuccess && !error && !hasShownSuccess) {
      setShow(false);
    }
  }, [isPending, isSuccess, error, hasShownSuccess]);

  if (!show) return null;

  const baseScanUrl = hash
    ? `https://sepolia.basescan.org/tx/${hash}`
    : null;

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  return (
    <div className={styles.container}>
      {isPending && (
        <div className={`${styles.status} ${styles.pending}`}>
          <div className={styles.icon}>⏳</div>
          <div className={styles.content}>
            <div className={styles.title}>{label} Pending...</div>
            <div className={styles.message}>
              Waiting for blockchain confirmation
            </div>
            {hash && (
              <a
                href={baseScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View on BaseScan →
              </a>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className={styles.dismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {isSuccess && !isPending && (
        <div className={`${styles.status} ${styles.success}`}>
          <div className={styles.icon}>✅</div>
          <div className={styles.content}>
            <div className={styles.title}>{label} Successful!</div>
            <div className={styles.message}>
              Transaction confirmed on blockchain
            </div>
            {hash && (
              <a
                href={baseScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View on BaseScan →
              </a>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className={styles.dismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {error && !isPending && (
        <div className={`${styles.status} ${styles.error}`}>
          <div className={styles.icon}>❌</div>
          <div className={styles.content}>
            <div className={styles.title}>{label} Failed</div>
            <div className={styles.message}>
              {error.message || "Transaction failed. Please try again."}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className={styles.dismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

