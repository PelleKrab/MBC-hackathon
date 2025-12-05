"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { TransactionStatus } from "./TransactionStatus";
import { useBountyContract } from "../lib/hooks/useBountyContract";

/**
 * Global transaction status that persists across the app
 * Tracks the most recent transaction from any hook
 */
export function GlobalTransactionStatus() {
  const { address, isConnected } = useAccount();
  const [lastTransaction, setLastTransaction] = useState<{
    hash?: `0x${string}`;
    isPending?: boolean;
    isSuccess?: boolean;
    error?: Error | null;
    label?: string;
  } | null>(null);

  // This would need to be connected to actual transaction hooks
  // For now, we'll use a simple approach - this can be enhanced
  // to listen to transaction events from wagmi

  // Clear transaction after it's been shown for a while
  useEffect(() => {
    if (lastTransaction?.isSuccess && !lastTransaction.isPending) {
      const timer = setTimeout(() => {
        setLastTransaction(null);
      }, 10000); // Show for 10 seconds
      return () => clearTimeout(timer);
    }
  }, [lastTransaction]);

  if (!lastTransaction || !isConnected) return null;

  return (
    <TransactionStatus
      hash={lastTransaction.hash}
      isPending={lastTransaction.isPending}
      isSuccess={lastTransaction.isSuccess}
      error={lastTransaction.error}
      label={lastTransaction.label}
      onDismiss={() => setLastTransaction(null)}
    />
  );
}

