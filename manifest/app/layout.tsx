import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Manifest - MBC Prediction Markets",
  description:
    "Bet on outcomes at the Midwest Blockchain Conference. Guess timestamps, win rewards.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Manifest - MBC Prediction Markets",
    description:
      "Place predictions on MBC events. Guess the exact timestamp and win big!",
    type: "website",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/hero.png`,
        width: 1200,
        height: 630,
        alt: "Manifest - MBC Prediction Markets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manifest - MBC Prediction Markets",
    description:
      "Place predictions on MBC events. Guess the exact timestamp and win big!",
    images: [`${BASE_URL}/hero.png`],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${BASE_URL}/hero.png`,
    "fc:frame:button:1": "Open App",
    "fc:frame:button:1:action": "launch_frame",
    "fc:frame:button:1:target": BASE_URL,
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
