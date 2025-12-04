const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object for Manifest - Prediction Markets
 * Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "Manifest",
    subtitle: "On-chain Prediction Markets",
    description:
      "Bet on outcomes, guess timestamps, win rewards. Place binary predictions on crypto markets with a unique timestamp guessing game. 90% goes to winning side, 10% to the best timestamp guess.",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0d1117",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["prediction-market", "defi", "crypto", "betting"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Predict the future, win rewards",
    ogTitle: "Manifest - On-chain Prediction Markets",
    ogDescription:
      "Bet on crypto outcomes with a unique timestamp guessing game. Join the prediction market revolution on Base.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
