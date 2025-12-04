import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manifest - On-chain Prediction Markets",
  description:
    "Bet on outcomes, guess timestamps, win rewards. Place binary predictions on crypto markets with a unique timestamp guessing game on Base.",
  openGraph: {
    title: "Manifest - On-chain Prediction Markets",
    description:
      "Bet on crypto outcomes with a unique timestamp guessing game. Join the prediction market revolution on Base.",
    type: "website",
    images: ["/hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manifest - On-chain Prediction Markets",
    description:
      "Bet on crypto outcomes with a unique timestamp guessing game. Join the prediction market revolution on Base.",
    images: ["/hero.png"],
  },
  other: {
    "fc:frame": "vNext",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
