import { Market, Prediction, PredictionInput } from "./types";
import { generateMockMarkets } from "./utils/mockData";

const MARKETS_KEY = "pm_markets_v2"; // Versioned key to force refresh
const PREDICTIONS_KEY = "pm_predictions_v2";

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

// Storage class that handles client-side localStorage safely
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

    const existingMarkets = this.getItem(MARKETS_KEY);
    if (!existingMarkets) {
      const mockMarkets = generateMockMarkets();
      this.setItem(MARKETS_KEY, JSON.stringify(mockMarkets));
    }

    const existingPredictions = this.getItem(PREDICTIONS_KEY);
    if (!existingPredictions) {
      this.setItem(PREDICTIONS_KEY, JSON.stringify([]));
    }
  }

  // Force refresh all market data with new mock data
  refreshMarkets(): void {
    if (!getBrowserStorage()) return;
    const mockMarkets = generateMockMarkets();
    this.setItem(MARKETS_KEY, JSON.stringify(mockMarkets));
    this.setItem(PREDICTIONS_KEY, JSON.stringify([]));
  }

  getMarkets(): Market[] {
    if (!getBrowserStorage()) return [];

    const data = this.getItem(MARKETS_KEY);
    if (!data) {
      this.initializeSeedData();
      const newData = this.getItem(MARKETS_KEY);
      return newData ? JSON.parse(newData) : [];
    }

    return JSON.parse(data);
  }

  getMarket(id: string): Market | null {
    const markets = this.getMarkets();
    return markets.find((m) => m.id === id) || null;
  }

  updateMarket(id: string, updates: Partial<Market>): Market | null {
    const markets = this.getMarkets();
    const index = markets.findIndex((m) => m.id === id);

    if (index === -1) return null;

    markets[index] = { ...markets[index], ...updates };
    this.setItem(MARKETS_KEY, JSON.stringify(markets));

    return markets[index];
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
    const { marketId, amount, prediction: predictionChoice } = input;

    const newPrediction: Prediction = {
      ...input,
      id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };

    // Save prediction
    const predictions = this.getPredictions();
    predictions.push(newPrediction);
    this.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));

    // Update market pools
    const market = this.getMarket(marketId);
    if (market) {
      const timestampPoolAmount = amount * 0.1; // 10% to timestamp pool
      const predictionPoolAmount = amount * 0.9; // 90% to yes/no pool

      const updates: Partial<Market> = {
        timestampPool: market.timestampPool + timestampPoolAmount,
      };

      if (predictionChoice === "yes") {
        updates.yesPool = market.yesPool + predictionPoolAmount;
      } else {
        updates.noPool = market.noPool + predictionPoolAmount;
      }

      this.updateMarket(marketId, updates);
    }

    return newPrediction;
  }

  getUserPredictions(userAddress: string, marketId?: string): Prediction[] {
    const predictions = this.getPredictions(marketId);
    return predictions.filter(
      (p) => p.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }

  clearAllData(): void {
    this.removeItem(MARKETS_KEY);
    this.removeItem(PREDICTIONS_KEY);
    // Also clear old versioned keys
    this.removeItem("pm_markets");
    this.removeItem("pm_predictions");
    this.initializeSeedData();
  }
}

// Export singleton instance
export const storage = new StorageService();
