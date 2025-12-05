# How Orders Get Executed - YES/NO Prediction System

## Our System: Pool-Based AMM (Not Order Book)

Our contract uses a **pool-based system** (similar to Uniswap), NOT an order book system. Here's how it works:

## How Predictions Are Executed

### 1. User Places Prediction (Immediate Execution)

When a user calls `placePrediction()`:

```solidity
function placePrediction(
    uint256 marketId,
    bool prediction,        // true = YES, false = NO
    uint256 timestampGuess,
    uint256 amount          // Amount of USDC to bet
) external {
    // Step 1: Transfer USDC from user to contract (IMMEDIATE)
    usdc.safeTransferFrom(msg.sender, address(this), amount);
    
    // Step 2: Split the bet
    uint256 bountyAmount = (amount * 1000) / 10000;      // 10% to bounty
    uint256 predictionAmount = (amount * 9000) / 10000;   // 90% to pool
    
    // Step 3: Add to appropriate pool (IMMEDIATE)
    if (prediction) {
        market.yesPool += predictionAmount;  // Goes to YES pool
    } else {
        market.noPool += predictionAmount;   // Goes to NO pool
    }
    
    // Step 4: Store prediction
    // Done! Execution is complete
}
```

**Key Point**: Execution is **IMMEDIATE** - there's no waiting for a matching order!

## Pool-Based Pricing (Like Uniswap)

### How Odds Are Calculated

Odds are determined by the **ratio of pools**, not by matching orders:

```
YES Pool: 1000 USDC
NO Pool:  2000 USDC
Total:    3000 USDC

Odds:
- YES: 33.3% (1000/3000)
- NO:  66.7% (2000/3000)
```

### Example: User Bets 100 USDC on YES

**Before:**
- YES Pool: 1000 USDC
- NO Pool: 2000 USDC
- Total: 3000 USDC

**User bets 100 USDC on YES:**
- 90 USDC → YES Pool (90% of bet)
- 10 USDC → Bounty Pool (10% of bet)

**After:**
- YES Pool: 1090 USDC (1000 + 90)
- NO Pool: 2000 USDC (unchanged)
- Total: 3090 USDC

**New Odds:**
- YES: 35.3% (1090/3090)
- NO: 64.7% (2000/3090)

## Potential Payout Calculation

The `calculatePotentialPayout()` function shows what you'd win:

```solidity
function calculatePotentialPayout(
    uint256 marketId,
    bool prediction,
    uint256 amount
) external view returns (uint256) {
    // Current pool sizes
    uint256 currentPool = prediction ? market.yesPool : market.noPool;
    uint256 opposingPool = prediction ? market.noPool : market.yesPool;
    
    // Your bet (90% goes to pool)
    uint256 netBet = (amount * 9000) / 10000;
    
    // Calculate your share
    uint256 newPool = currentPool + netBet;
    uint256 share = (netBet * 1e18) / newPool;
    
    // Total winnings if you win
    uint256 totalWinnings = ((currentPool + opposingPool + netBet) * share) / 1e18;
    
    return totalWinnings;
}
```

### Example Calculation

**Current State:**
- YES Pool: 1000 USDC
- NO Pool: 2000 USDC

**You bet 100 USDC on YES:**
- Your contribution: 90 USDC to YES pool
- New YES Pool: 1090 USDC
- Your share: 90/1090 = 8.26%

**If YES wins:**
- Total pool: 1090 + 2000 = 3090 USDC
- Your payout: 3090 × 8.26% = 255.23 USDC
- Profit: 255.23 - 100 = 155.23 USDC

## Comparison: Our System vs Order Book

### Our System (Pool-Based AMM)
```
User → placePrediction(amount) → IMMEDIATE EXECUTION
                                    ↓
                            USDC transferred
                            Pool updated
                            Odds recalculated
```

**Advantages:**
- ✅ Immediate execution (no waiting)
- ✅ Always liquid (pool provides liquidity)
- ✅ Simple UX (just bet amount)
- ✅ No slippage from order matching

**Disadvantages:**
- ❌ Odds change as you bet (slippage)
- ❌ Less control over price

### Order Book System (Like Polymarket)
```
User → placeOrder(price, amount) → WAIT FOR MATCH
                                    ↓
                            Order sits in book
                            Matches when counterparty found
                            Execution happens later
```

**Advantages:**
- ✅ Set your own price
- ✅ No slippage (if matched)
- ✅ More control

**Disadvantages:**
- ❌ May not execute (no match)
- ❌ More complex UX
- ❌ Requires counterparty

## Execution Flow Diagram

```
┌─────────────────────────────────────────┐
│  User wants to bet 100 USDC on YES     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  1. Approve USDC (if not already)      │
│     usdc.approve(contract, 100)         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  2. Call placePrediction()              │
│     - marketId: 1                       │
│     - prediction: true (YES)            │
│     - amount: 100 USDC                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  3. Contract Executes IMMEDIATELY:      │
│     ✓ Transfer 100 USDC from user       │
│     ✓ Split: 90 USDC → YES pool         │
│           10 USDC → Bounty pool         │
│     ✓ Update pool sizes                 │
│     ✓ Store prediction                  │
│     ✓ Emit event                        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  4. Execution Complete!                │
│     - User's USDC is in contract        │
│     - Pool updated                      │
│     - Odds recalculated                 │
│     - Prediction stored                 │
└─────────────────────────────────────────┘
```

## Key Differences from Traditional Exchanges

### Traditional Exchange (Order Book)
1. User places **limit order** (price + amount)
2. Order sits in **order book**
3. Waits for **matching order**
4. Execution happens when matched
5. **May never execute** if no match

### Our System (Pool-Based)
1. User places **market order** (just amount)
2. **Immediate execution** against pool
3. Pool provides liquidity
4. **Always executes** (if market is active)
5. Odds adjust automatically

## When Market Resolves

After deadline passes and market resolves:

```solidity
function resolveMarket(marketId, correctAnswer, timestamp) {
    // Distribute winnings to winners
    // Winners get proportional share of winning pool
    
    // Example: YES wins
    // - All YES bettors share the YES pool proportionally
    // - Bounty claimant gets bounty pool
    // - NO bettors get nothing
}
```

**Example Resolution:**
- YES Pool: 2000 USDC
- NO Pool: 1000 USDC
- Bounty Pool: 300 USDC
- **YES wins!**

**Payouts:**
- YES winners: Share 2000 USDC proportionally
- Bounty claimant: 300 USDC
- NO bettors: 0 USDC

## Summary

**How orders execute:**
1. ✅ **Immediate execution** - No waiting, no order book
2. ✅ **Pool-based** - Bet against the pool, not other users
3. ✅ **Automatic pricing** - Odds calculated from pool ratios
4. ✅ **Always liquid** - Pool provides liquidity
5. ✅ **Simple UX** - Just specify amount, not price

**Think of it like:**
- **Uniswap**: Swap tokens against a pool
- **Our system**: Bet YES/NO against a pool

The execution is **instant** and **guaranteed** (as long as market is active)!

