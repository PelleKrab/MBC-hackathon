"use client";

import dynamic from "next/dynamic";
import styles from "./styles/page.module.css";

// Dynamically import App with no SSR to avoid hydration issues
const App = dynamic(
  () => import("./components/App").then((mod) => ({ default: mod.App })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loadingPage}>
        <div className={styles.loadingLogo}>🎯</div>
        <p className={styles.loadingTitle}>Manifest</p>
        <div className={styles.loadingSpinner} />
      </div>
    ),
  }
);

export default function Home() {
  return <App />;
}
