"use client";

import { Market } from "../lib/types";
import {
  calculateOdds,
  calculateTotalPool,
  formatTimeRemaining,
  formatAmount,
} from "../lib/utils/calculations";
import styles from "../styles/MarketCard.module.css";

interface MarketCardProps {
  market: Market;
  onPlaceBet: (market: Market) => void;
  index?: number;
}

export function MarketCard({ market, onPlaceBet, index = 0 }: MarketCardProps) {
  const { yesOdds, noOdds } = calculateOdds(market);
  const totalPool = calculateTotalPool(market);
  const timeRemaining = formatTimeRemaining(market.deadline);

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <header className={styles.header}>
        <h3 className={styles.question}>{market.question}</h3>
        <div className={styles.timeTag}>
          <span className={styles.timeIcon}>⏱</span>
          {timeRemaining}
        </div>
      </header>

      <p className={styles.description}>{market.description}</p>

      <div className={styles.oddsSection}>
        <div className={styles.oddsBar}>
          <div className={styles.yesBar} style={{ width: `${yesOdds}%` }} />
          <div className={styles.noBar} style={{ width: `${noOdds}%` }} />
        </div>
        <div className={styles.oddsLabels}>
          <span className={styles.yesLabel}>
            <span className={styles.indicator} />
            YES {yesOdds.toFixed(1)}%
          </span>
          <span className={styles.noLabel}>
            NO {noOdds.toFixed(1)}%
            <span className={styles.indicator} />
          </span>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.poolInfo}>
          <span className={styles.poolLabel}>Total Pool</span>
          <span className={styles.poolAmount}>{formatAmount(totalPool)} ETH</span>
        </div>
        <button className={styles.betButton} onClick={() => onPlaceBet(market)}>
          Place Prediction
        </button>
      </footer>
    </article>
  );
}

