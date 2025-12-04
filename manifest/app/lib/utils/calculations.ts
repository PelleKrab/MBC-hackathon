import { Market } from "../types";

export function calculateOdds(market: Market): { yesOdds: number; noOdds: number } {
  const totalPool = market.yesPool + market.noPool;

  if (totalPool === 0) {
    return { yesOdds: 50, noOdds: 50 };
  }

  const yesOdds = (market.yesPool / totalPool) * 100;
  const noOdds = (market.noPool / totalPool) * 100;

  return {
    yesOdds: Math.round(yesOdds * 10) / 10,
    noOdds: Math.round(noOdds * 10) / 10,
  };
}

export function calculateTotalPool(market: Market): number {
  return market.yesPool + market.noPool + market.timestampPool;
}

export function calculatePotentialPayout(
  market: Market,
  prediction: "yes" | "no",
  amount: number
): number {
  if (amount <= 0) return 0;

  const currentPool = prediction === "yes" ? market.yesPool : market.noPool;
  const opposingPool = prediction === "yes" ? market.noPool : market.yesPool;
  const contributionToPool = amount * 0.9; // 90% goes to prediction pool

  // If you win, you get your share of the total betting pool
  const newPool = currentPool + contributionToPool;
  const share = contributionToPool / newPool;
  const totalWinnings = (currentPool + opposingPool + contributionToPool) * share;

  return Math.round(totalWinnings * 10000) / 10000;
}

export function formatTimeRemaining(deadline: number): string {
  const now = Date.now();
  const diff = deadline - now;

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "< 1m";
  }
}

export function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(2);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

