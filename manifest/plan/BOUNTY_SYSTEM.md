# Bounty System - Implementation Guide

## Overview

The Manifest prediction market platform includes a **bounty system** that rewards users who actually make events happen, not just predict them. This creates a unique incentive structure where:

- **80%** of bets go to winners (proportional)
- **10%** goes to best timestamp guesser
- **10%** goes to the person who **makes the event happen** (bounty)

## How It Works

### 1. Market Creation
Anyone can create a market with a question like "Will Jesse get pied in the face at MBC?"

### 2. Users Place Bets
Users bet ETH on YES or NO. Each bet is automatically split:
- 80% → Prediction pool (YES or NO)
- 10% → Timestamp pool
- 10% → Bounty pool

### 3. Someone Makes It Happen
After the betting deadline, someone can:
- Actually make the event happen (pie Jesse in the face!)
- Take a photo as proof
- Submit proof with timestamp

### 4. Admin Verification
An admin reviews the proof:
- Checks the photo
- Verifies the timestamp
- Approves or rejects

### 5. Market Resolution
When the market resolves:
- **Bounty claimant** gets 10% of all bets
- **Best timestamp guesser** gets 10%
- **Winners** share 80% proportionally

## Smart Contract Flow

```solidity
// 1. User submits proof (off-chain)
// Proof stored in localStorage/backend

// 2. Admin verifies proof
verifyBountyClaim(marketId, claimant, actualTimestamp)

// 3. Market resolves
resolveMarket(marketId, correctAnswer, actualTimestamp)
// Automatically distributes bounty to verified claimant
```

## Frontend Flow

### For Users (Making Events Happen)

1. **See Bounty Amount**
   - Market cards show bounty pool size
   - "Submit Proof" button appears after deadline

2. **Submit Proof**
   - Click "Submit Proof" on a market
   - Upload photo
   - Enter timestamp when event happened
   - Add optional description
   - Submit

3. **Wait for Verification**
   - Proof status: "Pending"
   - Admin reviews and approves/rejects

4. **Receive Bounty**
   - If approved, bounty is distributed on market resolution
   - Claimant receives 10% of all bets

### For Admins (Verifying Proofs)

1. **Access Admin Panel**
   - Navigate to `/admin` (or similar)
   - View all pending proofs

2. **Review Proof**
   - See photo
   - Check timestamp
   - Verify it matches market question

3. **Approve or Reject**
   - Approve: Sets bounty claimant in contract
   - Reject: Marks proof as rejected

## Implementation Details

### Proof Submission
- **Storage**: localStorage (hackathon) or IPFS/database (production)
- **Image Upload**: Base64 for hackathon, IPFS for production
- **Validation**: Timestamp must be after deadline, before now

### Admin Verification
- **Access Control**: Simple boolean flag (hackathon)
- **Production**: Multi-sig or DAO governance
- **Contract Call**: `verifyBountyClaim()` sets claimant address

### Bounty Distribution
- **Automatic**: Happens during `resolveMarket()`
- **Trustless**: Smart contract handles distribution
- **Transparent**: All on-chain

## Example Flow

### Market: "Will Jesse get pied in the face?"

1. **Market Created**: Bounty pool starts at 0 ETH
2. **Users Bet**: 
   - Alice bets 1 ETH on YES
   - Bob bets 0.5 ETH on NO
   - Total: 1.5 ETH
   - Bounty pool: 0.15 ETH (10%)
3. **Deadline Passes**: Betting closed
4. **Bob Pies Jesse**: Takes photo, submits proof
5. **Admin Approves**: Proof verified
6. **Market Resolves**: YES wins
7. **Payouts**:
   - Bob (bounty): 0.15 ETH
   - Best timestamp guesser: 0.15 ETH
   - Alice (winner): 1.2 ETH (80% of 1.5 ETH)

## Benefits

1. **Incentivizes Action**: People are motivated to make events happen
2. **Creates Engagement**: More interesting than passive prediction
3. **Fair Distribution**: Rewards actual contribution
4. **Transparent**: All on-chain, verifiable

## Security Considerations

### For Hackathon
- Simple admin verification
- Base64 image storage
- localStorage for proofs

### For Production
- IPFS for image storage
- Multi-sig for admin verification
- Oracle integration for automatic verification
- Reputation system for claimants
- Dispute resolution mechanism

## Future Enhancements

1. **Reputation System**: Track successful bounty claims
2. **Multiple Claimants**: Split bounty if multiple people contribute
3. **Video Proof**: Support video submissions
4. **Community Voting**: DAO-based verification
5. **Automatic Verification**: Oracle integration for verifiable events

