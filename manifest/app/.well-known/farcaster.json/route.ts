import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjM4MjUwMSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEVhYmI4NGE4NjgxZjcwMkE1Yzc0OTE1MDNkNTM4MDYzNDYxMDNGMUIifQ",
      payload: "eyJkb21haW4iOiJtYmMtaGFja2F0aG9uLnZlcmNlbC5hcHAifQ",
      signature:
        "LKOsHD/fXEBTEIXNdOaqvS0iT9DJbNg20JwoDwruCxQD49nFHyuEJlvfUatGJ5tJZ4eGDiqoQ2iD2WpP9jMgfRs=",
    },
    frame: {
      version: "1",
      name: "Manifest",
      subtitle: "MBC Prediction Markets",
      description:
        "Bet on outcomes at the Midwest Blockchain Conference. Guess timestamps, win rewards. 90% goes to winning side, 10% to best timestamp guess.",
      screenshotUrls: [`${BASE_URL}/screenshot.png`],
      iconUrl: `${BASE_URL}/icon.png`,
      splashImageUrl: `${BASE_URL}/splash.png`,
      splashBackgroundColor: "#0d1117",
      homeUrl: BASE_URL,
      webhookUrl: `${BASE_URL}/api/webhook`,
      primaryCategory: "games",
      tags: ["prediction-market", "betting", "crypto", "base", "mbc"],
      heroImageUrl: `${BASE_URL}/hero.png`,
      tagline: "Predict MBC outcomes, win ETH",
      ogTitle: "Manifest - MBC Prediction Markets",
      ogDescription:
        "Place predictions on Midwest Blockchain Conference events. Guess the exact timestamp and win big!",
      ogImageUrl: `${BASE_URL}/hero.png`,
    },
  };

  return NextResponse.json(manifest);
}
