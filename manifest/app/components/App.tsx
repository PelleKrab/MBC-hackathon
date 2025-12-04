"use client";

import { useEffect, useState, useCallback } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Market } from "../lib/types";
import { storage } from "../lib/storage";
import { MarketList } from "./MarketList";
import styles from "../styles/page.module.css";
import "@coinbase/onchainkit/styles.css";

function AppContent() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  // Signal to MiniKit that the app is ready
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [isMiniAppReady, setMiniAppReady]);

  const loadMarkets = useCallback(() => {
    storage.initializeSeedData();
    const allMarkets = storage.getMarkets();
    const activeMarkets = allMarkets
      .filter((m) => m.status === "active" && m.deadline > Date.now())
      .sort((a, b) => a.deadline - b.deadline);
    setMarkets(activeMarkets);
    setIsLoading(false);
  }, []);

  // On first load, check if we have valid markets, if not refresh
  useEffect(() => {
    storage.initializeSeedData();
    const allMarkets = storage.getMarkets();
    const activeMarkets = allMarkets.filter(
      (m) => m.status === "active" && m.deadline > Date.now()
    );
    
    // If no active markets, refresh with new data
    if (activeMarkets.length === 0) {
      storage.refreshMarkets();
    }
    
    loadMarkets();
    const interval = setInterval(loadMarkets, 30000);
    return () => clearInterval(interval);
  }, [loadMarkets]);

  const handleRefresh = () => {
    storage.refreshMarkets();
    loadMarkets();
  };

  // Calculate some stats
  const totalPool = markets.reduce(
    (sum, m) => sum + m.yesPool + m.noPool + m.timestampPool,
    0
  );

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.branding}>
            <div className={styles.logo}>🎯</div>
            <div className={styles.titleGroup}>
              <h1 className={styles.title}>Manifest</h1>
              <span className={styles.subtitle}>MBC Predictions</span>
            </div>
          </div>
          <div className={styles.walletSection}>
            <Wallet />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.heroBanner}>
          <span className={styles.heroEmoji}>🏔️</span>
          <h2 className={styles.heroTitle}>Midwest Blockchain Conference</h2>
          <p className={styles.heroSubtitle}>
            Predict what happens at MBC • Win bragging rights & ETH
          </p>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{markets.length}</span>
            <span className={styles.statLabel}>Active Bets</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalPool.toFixed(1)}</span>
            <span className={styles.statLabel}>ETH in Pool</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>10%</span>
            <span className={styles.statLabel}>Timestamp Bonus</span>
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Live Markets</h2>
          <p className={styles.sectionSubtitle}>
            Place your bets • Guess the exact time • Win big
          </p>
          <button onClick={handleRefresh} className={styles.refreshButton}>
            🔄 Reset Markets
          </button>
        </div>

        <MarketList
          markets={markets}
          userAddress={address}
          isLoading={isLoading}
          onPredictionSuccess={loadMarkets}
        />
      </main>
    </div>
  );
}

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingLogo}>🎯</div>
        <p className={styles.loadingTitle}>Manifest</p>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "dark",
        },
        wallet: {
          display: "modal",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
      }}
    >
      <AppContent />
    </OnchainKitProvider>
  );
}
