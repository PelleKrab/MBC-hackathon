# Base Prediction Market Mini App - Implementation Plan

## Overview
Build a prediction market frontend where users can:
- Browse active prediction markets
- Place binary yes/no predictions with an amount
- Guess the exact timestamp when the event will resolve
- 90% of predictions go to winning side, 10% goes to the person who guesses the closest timestamp

## Technical Stack (Already in place)
- Next.js 15 + TypeScript + React 19
- OnChainKit (Base integration)
- Farcaster MiniKit SDK
- Wagmi/Viem (for wallet connections)
- React Query (state management)
- CSS Modules (styling)
- localStorage (data persistence)

---

## Data Model

### Market Type
```typescript
interface Market {
  id: string;                    // Unique identifier
  question: string;              // "Will ETH reach $5000 by end of 2025?"
  description: string;           // Additional context
  deadline: number;              // Unix timestamp when betting closes
  resolutionDate: number;        // Expected resolution time
  yesPool: number;               // Total amount bet on YES
  noPool: number;                // Total amount bet on NO
  timestampPool: number;         // 10% of all bets
  status: 'active' | 'closed' | 'resolved';
  correctAnswer?: 'yes' | 'no';  // Set when resolved
  actualTimestamp?: number;      // Actual event timestamp
  createdAt: number;
}
```

### Prediction Type
```typescript
interface Prediction {
  id: string;
  marketId: string;
  userAddress: string;           // From connected wallet
  prediction: 'yes' | 'no';
  amount: number;
  timestampGuess: number;        // Unix timestamp guess
  createdAt: number;
}
```

---

## File Structure

```
manifest/
├── app/
│   ├── page.tsx                          # Main browse page (MODIFY)
│   ├── components/
│   │   ├── MarketCard.tsx               # Display individual market
│   │   ├── MarketList.tsx               # Grid/list of markets
│   │   ├── PredictionModal.tsx          # Modal for placing predictions
│   │   └── TimestampPicker.tsx          # DateTime picker component
│   ├── lib/
│   │   ├── types.ts                     # TypeScript interfaces
│   │   ├── storage.ts                   # localStorage utilities
│   │   ├── hooks/
│   │   │   ├── useMarkets.ts            # Fetch/manage markets
│   │   │   └── usePredictions.ts        # Fetch/manage predictions
│   │   └── utils/
│   │       ├── calculations.ts          # Pool calculations, odds, etc.
│   │       └── mockData.ts              # Initial seed data
│   └── styles/
│       ├── MarketCard.module.css
│       ├── MarketList.module.css
│       └── PredictionModal.module.css
```

---

## Core Features Implementation

### 1. LocalStorage Service (`lib/storage.ts`)
- `getMarkets()` - Retrieve all markets
- `getMarket(id)` - Get single market
- `addPrediction(prediction)` - Add new prediction and update pools
- `getPredictions(marketId?)` - Get predictions (all or for specific market)
- `initializeSeedData()` - Create initial markets if none exist

**Logic for adding prediction:**
1. Calculate 10% for timestamp pool
2. Add 90% to yes/no pool
3. Update market totals
4. Store prediction

### 2. Browse Markets Page (`page.tsx`)
- Display grid of active markets
- Show key info: question, deadline, pool sizes, odds
- Click to open prediction modal
- Mobile-responsive design

### 3. Market Card Component (`components/MarketCard.tsx`)
**Displays:**
- Market question
- Time remaining until deadline
- Current odds (yes % vs no %)
- Total pool size
- "Place Bet" button

**Calculations:**
- Odds: `yesPool / (yesPool + noPool) * 100`
- Time remaining: Format deadline countdown
- Total pool: `yesPool + noPool + timestampPool`

### 4. Prediction Modal (`components/PredictionModal.tsx`)
**Features:**
- Yes/No selection buttons
- Amount input (with validation)
- Timestamp picker for guess
- Show potential payout calculation
- Connected wallet check
- Submit button

**Validation:**
- User must have connected wallet
- Amount > 0
- Timestamp guess must be after market deadline
- Timestamp guess must be reasonable (within expected range)

### 5. Timestamp Picker (`components/TimestampPicker.tsx`)
- Date picker
- Time picker (hours, minutes)
- Display in user's local timezone
- Convert to Unix timestamp
- Helper text showing market resolution context

---

## Implementation Order

### Phase 1: Foundation (Files 1-3)
1. **Create types** (`lib/types.ts`)
   - Define Market and Prediction interfaces
   - Export all shared types

2. **Build storage service** (`lib/storage.ts`)
   - Implement all localStorage functions
   - Add seed data for 3-5 example markets
   - Test CRUD operations

3. **Create utility functions** (`lib/utils/calculations.ts`, `lib/utils/mockData.ts`)
   - Pool calculation helpers
   - Odds calculation
   - Time formatting
   - Mock market data generator

### Phase 2: Custom Hooks (Files 4-5)
4. **Build useMarkets hook** (`lib/hooks/useMarkets.ts`)
   - Fetch markets from localStorage
   - Filter active markets
   - Sort by deadline or popularity
   - Use React Query for caching

5. **Build usePredictions hook** (`lib/hooks/usePredictions.ts`)
   - Fetch predictions
   - Add new prediction mutation
   - Update market pools

### Phase 3: UI Components (Files 6-8)
6. **Create MarketCard** (`components/MarketCard.tsx`)
   - Display market info
   - Calculate and show odds
   - Countdown timer
   - Click handler to open modal

7. **Create TimestampPicker** (`components/TimestampPicker.tsx`)
   - Date/time input
   - Unix timestamp conversion
   - Validation

8. **Create PredictionModal** (`components/PredictionModal.tsx`)
   - Yes/No toggle
   - Amount input
   - Integrate TimestampPicker
   - Submission logic
   - Success/error states

### Phase 4: Main Page (File 9)
9. **Build MarketList and update page.tsx**
   - Create MarketList component
   - Update main page to use MarketList
   - Add loading states
   - Add empty states
   - Handle modal open/close
   - Mobile responsive layout

### Phase 5: Polish
10. **Styling and UX refinements**
    - Consistent spacing and colors
    - Smooth animations
    - Loading spinners
    - Error messages
    - Success feedback

11. **Testing edge cases**
    - Empty markets
    - No wallet connected
    - Past deadlines
    - Invalid inputs

---

## Key Design Decisions

### Why localStorage?
- Simple for prototype
- No backend needed
- Instant reads/writes
- Per-device persistence
- Easy to migrate to real backend later

### Why binary yes/no?
- Simplest prediction model
- Easy pool calculations
- Clear winning side
- User-friendly UX

### Why 10% timestamp pool?
- Creates interesting secondary game
- Rewards precise prediction
- Small enough not to dilute main pools
- Winner-takes-all for timestamp

### Pool Distribution Logic
When prediction is placed:
- 10% → Timestamp pool (everyone contributes equally)
- 90% → User's chosen side (yes or no pool)

When market resolves:
- Winning side gets 90% pool proportional to their stake
- Best timestamp guess gets entire 10% pool

---

## MVP Success Criteria

✅ Users can browse 3+ active markets
✅ Users can see odds and pool sizes
✅ Users can place yes/no predictions with amount
✅ Users can guess timestamp during prediction
✅ Pools update correctly (90/10 split)
✅ Data persists in localStorage
✅ Mobile-friendly UI
✅ Works with OnChainKit wallet

---

## Future Enhancements (Not in MVP)
- Market detail page with all predictions
- User profile showing their predictions
- Create new markets
- Market resolution interface
- Payout claiming
- Leaderboard
- Market categories/filters
- Search functionality
- Social sharing

---

## Notes
- Keep components simple and focused
- Use existing OnChainKit wallet integration
- Maintain CSS modules pattern from starter
- Mobile-first responsive design
- Use React Query for all data fetching
- Validate all user inputs
- Handle loading and error states gracefully
