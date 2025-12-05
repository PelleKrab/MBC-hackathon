"use client";

import { useState, useEffect } from "react";
import { ProofSubmission } from "../lib/types";
import { storage } from "../lib/storage";
import { useVerifyProof } from "../lib/hooks/useBountyContract";
import { TransactionStatus } from "./TransactionStatus";
import styles from "../styles/AdminVerificationPanel.module.css";

interface AdminVerificationPanelProps {
  isAdmin?: boolean;
}

export function AdminVerificationPanel({ isAdmin = false }: AdminVerificationPanelProps) {
  const [proofs, setProofs] = useState<ProofSubmission[]>([]);
  const [selectedProof, setSelectedProof] = useState<ProofSubmission | null>(null);
  const { verifyProof, hash, isPending, isSuccess, error } = useVerifyProof();

  // Load pending proofs
  const loadPendingProofs = () => {
    const pending = storage.getPendingProofs();
    setProofs(pending);
  };

  useEffect(() => {
    if (isAdmin) {
      loadPendingProofs();
      // Refresh every 30 seconds
      const interval = setInterval(loadPendingProofs, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleApprove = async (proof: ProofSubmission) => {
    if (!isAdmin) {
      alert("Only admins can verify proofs");
      return;
    }

    try {
      // Call contract to verify proof
      const contractMarketId = parseInt(proof.marketId, 10);
      if (!isNaN(contractMarketId)) {
        await verifyProof(contractMarketId, proof.submitterAddress, proof.timestamp);
      }

      // Update proof status
      storage.updateProof(proof.id, {
        status: "approved",
        verifiedBy: "admin", // In production, use actual admin address
        verifiedAt: Date.now(),
      });

      // Update market with bounty claimant
      storage.updateMarket(proof.marketId, {
        bountyClaimant: proof.submitterAddress,
        actualTimestamp: proof.timestamp,
      });

      loadPendingProofs();
      setSelectedProof(null);
      alert("Proof approved! Bounty will be distributed on market resolution.");
    } catch (error) {
      console.error("Failed to approve proof:", error);
      alert("Failed to approve proof. Please try again.");
    }
  };

  const handleReject = (proof: ProofSubmission) => {
    if (!isAdmin) {
      alert("Only admins can reject proofs");
      return;
    }

    if (!confirm("Are you sure you want to reject this proof?")) {
      return;
    }

    storage.updateProof(proof.id, {
      status: "rejected",
      verifiedBy: "admin",
      verifiedAt: Date.now(),
    });

    loadPendingProofs();
    setSelectedProof(null);
  };

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.notAdmin}>
          <p>Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {(isPending || isSuccess || error) && (
        <TransactionStatus
          hash={hash}
          isPending={isPending}
          isSuccess={isSuccess}
          error={error}
          label="Proof Verification"
        />
      )}
      
      <div className={styles.header}>
        <h2 className={styles.title}>Proof Verification</h2>
        <button onClick={loadPendingProofs} className={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {proofs.length === 0 ? (
        <div className={styles.empty}>
          <p>No pending proofs to verify</p>
        </div>
      ) : (
        <div className={styles.proofList}>
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className={`${styles.proofCard} ${
                selectedProof?.id === proof.id ? styles.selected : ""
              }`}
              onClick={() => setSelectedProof(proof)}
            >
              <div className={styles.proofHeader}>
                <div>
                  <p className={styles.marketId}>Market: {proof.marketId}</p>
                  <p className={styles.submitter}>
                    Submitter: {proof.submitterAddress.slice(0, 6)}...
                    {proof.submitterAddress.slice(-4)}
                  </p>
                </div>
                <span className={styles.badge}>Pending</span>
              </div>
              <p className={styles.timestamp}>
                Event Time: {new Date(proof.timestamp).toLocaleString()}
              </p>
              <p className={styles.submitted}>
                Submitted: {new Date(proof.submittedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedProof && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h3>Proof Details</h3>
            <button
              onClick={() => setSelectedProof(null)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>

          <div className={styles.detailContent}>
            <div className={styles.imageSection}>
              <img
                src={selectedProof.imageUrl}
                alt="Proof"
                className={styles.proofImage}
              />
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Market ID:</span>
                <span className={styles.value}>{selectedProof.marketId}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Submitter:</span>
                <span className={styles.value}>{selectedProof.submitterAddress}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Event Timestamp:</span>
                <span className={styles.value}>
                  {new Date(selectedProof.timestamp).toLocaleString()}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Submitted:</span>
                <span className={styles.value}>
                  {new Date(selectedProof.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => handleReject(selectedProof)}
                className={styles.rejectButton}
                disabled={isPending}
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedProof)}
                className={styles.approveButton}
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Approve & Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

