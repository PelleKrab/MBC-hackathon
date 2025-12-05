"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import {
    Address,
    Avatar,
    Identity,
    Name,
} from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import "@coinbase/onchainkit/styles.css";
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { storage } from "../lib/storage";
import { Market } from "../lib/types";
import styles from "../styles/page.module.css";
import { CreateMarketModal } from "./CreateMarketModal";
import { MarketList } from "./MarketList";

function WalletButton() {
  return (
    <Wallet>
      <ConnectWallet>
        <Avatar className="h-6 w-6" />
        <Name />
      </ConnectWallet>
      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}

function AppContent() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

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

  useEffect(() => {
    storage.initializeSeedData();
    const allMarkets = storage.getMarkets();
    const activeMarkets = allMarkets.filter(
      (m) => m.status === "active" && m.deadline > Date.now()
    );

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

  const totalPool = markets.reduce(
    (sum, m) => sum + m.yesPool + m.noPool + (m.bountyPool || 0),
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
          <WalletButton />
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

        {!isConnected && (
          <div className={styles.connectPrompt}>
            <span className={styles.connectIcon}>👛</span>
            <p className={styles.connectText}>
              Connect your wallet to place predictions
            </p>
          </div>
        )}

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
          <div className={styles.headerActions}>
            <button onClick={handleRefresh} className={styles.refreshButton}>
              🔄 Reset Markets
            </button>
            {isConnected && (
              <button
                onClick={() => setShowCreateModal(true)}
                className={styles.createButton}
              >
                ➕ Create Market
              </button>
            )}
          </div>
        </div>

        <MarketList
          markets={markets}
          userAddress={address}
          isLoading={isLoading}
          onPredictionSuccess={loadMarkets}
        />

        {showCreateModal && (
          <CreateMarketModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadMarkets();
            }}
          />
        )}
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
          theme: "base",
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
