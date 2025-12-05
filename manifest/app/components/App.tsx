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
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { useMarkets } from "../lib/hooks/useMarkets";
import { isContractConfigured } from "../lib/contracts";
import styles from "../styles/page.module.css";
import { CreateMarketModal } from "./CreateMarketModal";
import { MarketList } from "./MarketList";

function WalletButton() {
  const { context } = useMiniKit();
  
  // If we're in a mini app and have context, show the connected state
  if (context && context.user) {
    return (
      <div className={styles.connectedBadge}>
        <span className={styles.connectedDot} />
        <span className={styles.connectedText}>
          {context.user.displayName || `FID: ${context.user.fid}`}
        </span>
      </div>
    );
  }

  // Otherwise show the regular wallet connect with dropdown
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { context, setMiniAppReady, isMiniAppReady } = useMiniKit();
  
  // Use contract-based market loading
  const { markets, isLoading, error, refetch } = useMarkets();
  
  // Get wallet address from wagmi, or use FID as identifier in mini app
  const walletAddress = address;
  const isUserConnected = isConnected || !!context?.user;
  const contractConfigured = isContractConfigured();

  // Signal to MiniKit that the app is ready
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [isMiniAppReady, setMiniAppReady]);

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

        {!contractConfigured && (
          <div className={styles.connectPrompt}>
            <span className={styles.connectIcon}>⚠️</span>
            <p className={styles.connectText}>
              Contract not configured. Set NEXT_PUBLIC_BOUNTY_CONTRACT_ADDRESS in .env
            </p>
          </div>
        )}

        {!isUserConnected && contractConfigured && (
          <div className={styles.connectPrompt}>
            <span className={styles.connectIcon}>👛</span>
            <p className={styles.connectText}>
              Connect your wallet to place predictions
            </p>
          </div>
        )}

        {error && (
          <div className={styles.connectPrompt}>
            <span className={styles.connectIcon}>❌</span>
            <p className={styles.connectText}>{error}</p>
          </div>
        )}

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{markets.length}</span>
            <span className={styles.statLabel}>Active Markets</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalPool.toFixed(2)}</span>
            <span className={styles.statLabel}>ETH in Pools</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>Bounty Pool</span>
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Live Markets</h2>
          <p className={styles.sectionSubtitle}>
            Fund bounties • Make events happen • Claim rewards
          </p>
          <div className={styles.headerActions}>
            <button onClick={refetch} className={styles.refreshButton}>
              🔄 Refresh
            </button>
            {isConnected && contractConfigured && (
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
          userAddress={walletAddress}
          isLoading={isLoading}
          onPredictionSuccess={refetch}
        />

        {showCreateModal && (
          <CreateMarketModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
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
