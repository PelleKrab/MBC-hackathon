# Manifest - MBC Prediction Markets

A prediction market mini app for the Midwest Blockchain Conference. Built with Next.js, OnchainKit, and Base.

## Features

- 🎯 Place YES/NO predictions on MBC events
- ⏱️ Guess the exact timestamp when events will happen
- 💰 90% of pool goes to winning side, 10% to best timestamp guess
- 👛 Base Smart Wallet integration
- 📱 Works as a Farcaster Mini App

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with:

```env
# Your deployment URL (for local dev, use http://localhost:3000)
NEXT_PUBLIC_URL=http://localhost:3000

# OnchainKit API Key from https://portal.cdp.coinbase.com/
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key

# Project name
NEXT_PUBLIC_PROJECT_NAME=Manifest
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/manifest.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repo
2. Set the root directory to `manifest`
3. Add environment variables:
   - `NEXT_PUBLIC_URL` = your Vercel deployment URL (e.g., `https://manifest-xyz.vercel.app`)
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY` = your CDP API key
   - `NEXT_PUBLIC_PROJECT_NAME` = `Manifest`

### 3. Test the Mini App

After deployment, your Farcaster manifest will be available at:
```
https://your-app.vercel.app/.well-known/farcaster.json
```

## Project Structure

```
manifest/
├── app/
│   ├── .well-known/
│   │   └── farcaster.json/     # Farcaster manifest endpoint
│   ├── api/
│   │   ├── auth/               # Auth endpoint
│   │   └── webhook/            # Webhook for notifications
│   ├── components/             # React components
│   ├── lib/                    # Utilities and hooks
│   └── styles/                 # CSS modules
├── public/                     # Static assets
├── next.config.ts             # Next.js configuration
└── vercel.json                # Vercel deployment config
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Blockchain**: Base (via OnchainKit)
- **Wallet**: Coinbase Smart Wallet
- **Mini App SDK**: Farcaster MiniKit
- **Styling**: CSS Modules

## License

MIT
