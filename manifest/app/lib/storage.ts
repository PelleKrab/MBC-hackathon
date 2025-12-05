import { Market, Prediction, PredictionInput, ProofSubmission, ProofSubmissionInput } from "./types";

const PREDICTIONS_KEY = "pm_predictions_v3";
const PROOFS_KEY = "pm_proofs_v1";

// Helper to check if we have a real browser localStorage
function getBrowserStorage(): Storage | null {
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined" &&
    typeof window.localStorage.getItem === "function"
  ) {
    return window.localStorage;
  }
  return null;
}

/**
 * Storage class for local caching of predictions and proofs
 * Markets are now fetched from the contract, not localStorage
 */
class StorageService {
  private getItem(key: string): string | null {
    const storage = getBrowserStorage();
    if (!storage) return null;
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  private setItem(key: string, value: string): void {
    const storage = getBrowserStorage();
    if (!storage) return;
    try {
      storage.setItem(key, value);
    } catch {
      console.error("Failed to save to localStorage");
    }
  }

  private removeItem(key: string): void {
    const storage = getBrowserStorage();
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch {
      console.error("Failed to remove from localStorage");
    }
  }

  initializeSeedData(): void {
    if (!getBrowserStorage()) return;

    const existingPredictions = this.getItem(PREDICTIONS_KEY);
    if (!existingPredictions) {
      this.setItem(PREDICTIONS_KEY, JSON.stringify([]));
    }

    const existingProofs = this.getItem(PROOFS_KEY);
    if (!existingProofs) {
      this.setItem(PROOFS_KEY, JSON.stringify([]));
    }
  }

  // Markets are now loaded from contract - these are placeholder methods
  getMarkets(): Market[] {
    // Markets come from contract now
    return [];
  }

  getMarket(_id: string): Market | null {
    // Markets come from contract now
    return null;
  }

  updateMarket(_id: string, _updates: Partial<Market>): Market | null {
    // Markets are on-chain now
    console.warn("Markets are now stored on-chain. Use contract methods to update.");
    return null;
  }

  refreshMarkets(): void {
    // Markets are on-chain now - no-op
    console.log("Markets are loaded from contract. Use refetch() to reload.");
  }

  getPredictions(marketId?: string): Prediction[] {
    if (!getBrowserStorage()) return [];

    const data = this.getItem(PREDICTIONS_KEY);
    if (!data) return [];

    const predictions: Prediction[] = JSON.parse(data);

    if (marketId) {
      return predictions.filter((p) => p.marketId === marketId);
    }

    return predictions;
  }

  addPrediction(input: PredictionInput): Prediction {
    const newPrediction: Prediction = {
      ...input,
      id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };

    // Save prediction locally (for UI tracking)
    const predictions = this.getPredictions();
    predictions.push(newPrediction);
    this.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));

    return newPrediction;
  }

  getUserPredictions(userAddress: string, marketId?: string): Prediction[] {
    const predictions = this.getPredictions(marketId);
    return predictions.filter(
      (p) => p.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }

  // Proof submission methods
  getProofs(marketId?: string): ProofSubmission[] {
    if (!getBrowserStorage()) return [];

    const data = this.getItem(PROOFS_KEY);
    if (!data) return [];

    const proofs: ProofSubmission[] = JSON.parse(data);

    if (marketId) {
      return proofs.filter((p) => p.marketId === marketId);
    }

    return proofs;
  }

  addProof(input: ProofSubmissionInput): ProofSubmission {
    const newProof: ProofSubmission = {
      ...input,
      id: `proof-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      submittedAt: Date.now(),
      status: "pending",
    };

    const proofs = this.getProofs();
    proofs.push(newProof);
    this.setItem(PROOFS_KEY, JSON.stringify(proofs));

    return newProof;
  }

  updateProof(proofId: string, updates: Partial<ProofSubmission>): ProofSubmission | null {
    const proofs = this.getProofs();
    const index = proofs.findIndex((p) => p.id === proofId);

    if (index === -1) return null;

    proofs[index] = { ...proofs[index], ...updates };
    this.setItem(PROOFS_KEY, JSON.stringify(proofs));

    return proofs[index];
  }

  getPendingProofs(): ProofSubmission[] {
    return this.getProofs().filter((p) => p.status === "pending");
  }

  clearAllData(): void {
    this.removeItem(PREDICTIONS_KEY);
    this.removeItem(PROOFS_KEY);
    // Clear old versioned keys
    this.removeItem("pm_markets");
    this.removeItem("pm_predictions");
    this.removeItem("pm_markets_v2");
    this.removeItem("pm_predictions_v2");
    this.removeItem("pm_markets_v3");
    this.initializeSeedData();
  }
}

// Export singleton instance
export const storage = new StorageService();
