# What Happens When Someone Makes an Event Happen

## Complete Flow: From Action to Payment

### Example: Market "Will Jesse get pied in the face?"

Let's trace what happens when Bob actually pies Jesse in the face:

---

## Step 1: Event Happens 🥧

**Bob pies Jesse in the face!**

- Bob takes a photo as proof
- Records the timestamp: `2025-01-15 14:30:00`
- Event is now a reality

**At this point:**
- Market deadline has passed (betting closed)
- Bounty pool has accumulated: 1.0 USDC (10% of all bets)
- Market is still "Active" (not resolved yet)

---

## Step 2: Submit Proof (Frontend) 📸

**Bob opens the app and submits proof:**

1. **Clicks "Submit Proof"** on the market card
2. **Uploads photo** of Jesse with pie on face
3. **Enters timestamp** when it happened: `2025-01-15 14:30:00`
4. **Adds description** (optional): "Pied Jesse at the hackathon!"
5. **Submits**

**What happens in code:**
```typescript
// Frontend: ProofSubmissionModal.tsx
const onSubmit = async (data) => {
  // 1. Upload image (currently to localStorage, future: IPFS)
  const imageUrl = await uploadImage(data.imageFile);
  
  // 2. Store proof submission
  storage.addProofSubmission({
    marketId: market.id,
    submitterAddress: userAddress,
    imageUrl: imageUrl,
    timestamp: data.timestamp,
    description: data.description,
    status: "pending" // Waiting for admin review
  });
};
```

**Result:**
- Proof stored (localStorage for hackathon, IPFS for production)
- Status: **"pending"**
- Admin can now see it in admin panel

---

## Step 3: Admin Reviews Proof 👨‍⚖️

**Admin opens Admin Verification Panel:**

1. **Sees pending proof** from Bob
2. **Reviews:**
   - ✅ Photo shows Jesse with pie
   - ✅ Timestamp is after deadline
   - ✅ Matches market question
3. **Decides:** Approve or Reject

**If Admin Approves:**

**Frontend calls contract:**
```typescript
// AdminVerificationPanel.tsx
await verifyBountyClaim({
  marketId: market.contractMarketId,
  claimant: bobAddress,
  actualTimestamp: proof.timestamp
});
```

**Contract executes:**
```solidity
// PredictionMarket.sol
function verifyBountyClaim(
    uint256 marketId,
    address claimant,        // Bob's address
    uint256 actualTimestamp  // When event happened
) external onlyAdmin {
    // Sets Bob as the bounty claimant
    market.bountyClaimant = bobAddress;
    market.actualTimestamp = actualTimestamp;
    
    emit BountyClaimVerified(marketId, bobAddress, actualTimestamp);
}
```

**What this does:**
- ✅ Sets `bountyClaimant = Bob's address`
- ✅ Sets `actualTimestamp = when event happened`
- ✅ Emits event (frontend can listen)
- ❌ **Does NOT pay yet** - payment happens on resolution

**Result:**
- Bob is now the **verified bounty claimant**
- Bounty pool is **locked** for Bob
- Market is still "Active" (waiting for resolution)

---

## Step 4: Market Resolution 🎯

**Admin resolves the market:**

```typescript
// Admin calls resolveMarket
await contract.resolveMarket(
  marketId,
  true,  // YES won (Jesse got pied!)
  actualTimestamp
);
```

**Contract executes `resolveMarket()`:**

```solidity
function resolveMarket(
    uint256 marketId,
    bool correctAnswer,  // true = YES won
    uint256 actualTimestamp
) external {
    // 1. Mark market as resolved
    market.status = MarketStatus.Resolved;
    market.correctAnswer = true; // YES won
    
    // 2. DISTRIBUTE BOUNTY TO BOB! 🎉
    if (market.bountyClaimant != address(0) && market.bountyPool > 0) {
        // Transfer 1.0 USDC to Bob
        usdc.safeTransfer(bobAddress, 1.0 USDC);
        emit WinningsDistributed(marketId, bobAddress, 1.0 USDC, "bounty");
    }
    
    // 3. Distribute winnings to YES winners
    distributeWinnerPayouts(marketId, true, market.yesPool);
    
    emit MarketResolved(marketId, true, actualTimestamp);
}
```

**What happens:**
1. ✅ **Bob receives 1.0 USDC** (entire bounty pool)
2. ✅ **YES winners** share the YES pool proportionally
3. ✅ **NO bettors** get nothing
4. ✅ Market status = "Resolved"

---

## Complete Timeline

```
Day 1-7: Betting Period
├─ Users place bets
├─ 10% goes to bounty pool
└─ Bounty pool grows: 1.0 USDC

Day 7: Deadline Passes
├─ Betting closes
└─ "Submit Proof" button appears

Day 8: Event Happens! 🥧
├─ Bob pies Jesse
├─ Takes photo
└─ Records timestamp

Day 8: Bob Submits Proof
├─ Uploads photo
├─ Enters timestamp
└─ Status: "pending"

Day 8: Admin Reviews
├─ Sees Bob's proof
├─ Verifies it's real
├─ Calls verifyBountyClaim()
└─ Bob = verified claimant ✅

Day 8: Market Resolves
├─ Admin calls resolveMarket()
├─ YES wins (Jesse got pied!)
├─ Bob receives 1.0 USDC 🎉
├─ YES winners share pool
└─ Market closed
```

---

## Key Points

### 1. **Two-Step Process**
- **Step 1:** Admin verifies proof → Sets claimant
- **Step 2:** Market resolves → Pays claimant

### 2. **Payment Timing**
- ❌ **NOT paid immediately** when proof is verified
- ✅ **Paid when market resolves**
- This ensures market outcome is determined first

### 3. **Who Gets What**

**If YES wins:**
- ✅ **Bob (bounty claimant):** 1.0 USDC (10% pool)
- ✅ **YES winners:** Share 9.0 USDC (90% pool)
- ❌ **NO bettors:** 0 USDC

**If NO wins:**
- ✅ **Bob (bounty claimant):** 1.0 USDC (10% pool)
- ❌ **YES bettors:** 0 USDC
- ✅ **NO winners:** Share 9.0 USDC (90% pool)

**Note:** Bounty claimant gets paid **regardless of outcome** (if verified)!

### 4. **What If No One Makes It Happen?**

If no one submits proof or proof is rejected:
- Bounty pool stays in contract
- Only winners get paid
- Bounty is "lost" (or could be refunded in future version)

---

## Example: Complete Scenario

**Market:** "Will ETH reach $5000 by Jan 20?"

**Bets:**
- Alice: 5 USDC on YES
- Charlie: 3 USDC on NO
- Total: 8 USDC
- Bounty pool: 0.8 USDC (10%)

**Event Happens:**
- Bob buys ETH, pushes price to $5000 on Jan 18
- Takes screenshot
- Submits proof

**Admin Verifies:**
- ✅ Proof approved
- Bob = bounty claimant

**Market Resolves:**
- YES wins (ETH reached $5000)
- **Bob gets:** 0.8 USDC (bounty)
- **Alice gets:** ~7.2 USDC (YES pool + share of NO pool)
- **Charlie gets:** 0 USDC

---

## Summary

**When someone makes an event happen:**

1. 📸 **Submit proof** (photo + timestamp)
2. 👨‍⚖️ **Admin verifies** → Sets as bounty claimant
3. 🎯 **Market resolves** → Bounty claimant gets paid
4. 💰 **Payment:** 10% of all bets in USDC

**The bounty claimant gets paid regardless of which side wins** - they're rewarded for making the event happen, not for predicting it!

