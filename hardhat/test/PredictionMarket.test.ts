import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { PredictionMarket } from "../typechain-types";
import { MockUSDC } from "../typechain-types/contracts/MockUSDC";

describe("PredictionMarket", function () {
  let predictionMarket: PredictionMarket;
  let mockUSDC: MockUSDC;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let bountyClaimant: SignerWithAddress;

  // Helper to parse USDC amounts (6 decimals)
  const parseUSDC = (amount: string) => ethers.parseUnits(amount, 6);

  beforeEach(async function () {
    [owner, user1, user2, user3, bountyClaimant] = await ethers.getSigners();

    // Deploy MockUSDC first
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy(parseUSDC("1000000")); // 1M USDC initial supply
    await mockUSDC.waitForDeployment();

    // Deploy PredictionMarket with USDC address
    const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
    const usdcAddress = await mockUSDC.getAddress();
    predictionMarket = await PredictionMarketFactory.deploy(usdcAddress);
    await predictionMarket.waitForDeployment();

    // Mint USDC to test users (10,000 USDC each)
    const usdcAmount = parseUSDC("10000");
    await mockUSDC.mint(user1.address, usdcAmount);
    await mockUSDC.mint(user2.address, usdcAmount);
    await mockUSDC.mint(user3.address, usdcAmount);
    await mockUSDC.mint(bountyClaimant.address, usdcAmount);
  });

  describe("Market Creation", function () {
    it("Should create a market successfully", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const deadline = (block?.timestamp || Math.floor(Date.now() / 1000)) + 86400;
      const resolutionDate = deadline + 86400;

      const tx = await predictionMarket
        .connect(user1)
        .createMarket(
          "Will ETH reach $5000?",
          "Test market",
          deadline,
          resolutionDate
        );

      await expect(tx)
        .to.emit(predictionMarket, "MarketCreated")
        .withArgs(1, user1.address, "Will ETH reach $5000?", deadline);

      const market = await predictionMarket.getMarket(1);
      expect(market.question).to.equal("Will ETH reach $5000?");
      expect(market.creator).to.equal(user1.address);
      expect(market.yesPool).to.equal(0);
      expect(market.noPool).to.equal(0);
      expect(market.bountyPool).to.equal(0);
    });

    it("Should reject market with past deadline", async function () {
      const pastDeadline = Math.floor(Date.now() / 1000) - 86400;
      const resolutionDate = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        predictionMarket
          .connect(user1)
          .createMarket("Test", "Test", pastDeadline, resolutionDate)
      ).to.be.revertedWith("Deadline must be in future");
    });

    it("Should reject market with resolution before deadline", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const deadline = (block?.timestamp || Math.floor(Date.now() / 1000)) + 86400;
      const resolutionDate = deadline - 3600;

      await expect(
        predictionMarket
          .connect(user1)
          .createMarket("Test", "Test", deadline, resolutionDate)
      ).to.be.revertedWith("Resolution must be after deadline");
    });
  });

  describe("Placing Predictions", function () {
    let marketId: bigint;
    let deadline: number;

    beforeEach(async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      deadline = (block?.timestamp || Math.floor(Date.now() / 1000)) + 86400;
      const resolutionDate = deadline + 86400;

      const tx = await predictionMarket
        .connect(user1)
        .createMarket("Test Market", "Description", deadline, resolutionDate);
      const receipt = await tx.wait();
      marketId = await predictionMarket.marketCounter();
    });

    it("Should place a YES prediction and update pools correctly", async function () {
      const betAmount = parseUSDC("1.0");
      const timestampGuess = deadline + 3600;
      const contractAddress = await predictionMarket.getAddress();

      // Approve USDC
      await mockUSDC.connect(user2).approve(contractAddress, betAmount);

      await expect(
        predictionMarket
          .connect(user2)
          .placePrediction(marketId, true, timestampGuess, betAmount)
      )
        .to.emit(predictionMarket, "PredictionPlaced")
        .withArgs(marketId, 1, user2.address, true, betAmount, timestampGuess);

      const market = await predictionMarket.getMarket(marketId);
      
      // 90% should go to yesPool, 10% to bountyPool
      const expectedYesPool = (betAmount * 9000n) / 10000n;
      const expectedBountyPool = (betAmount * 1000n) / 10000n;

      expect(market.yesPool).to.equal(expectedYesPool);
      expect(market.noPool).to.equal(0);
      expect(market.bountyPool).to.equal(expectedBountyPool);
    });

    it("Should place a NO prediction and update pools correctly", async function () {
      const betAmount = parseUSDC("1.0");
      const timestampGuess = deadline + 3600;
      const contractAddress = await predictionMarket.getAddress();

      // Approve USDC
      await mockUSDC.connect(user2).approve(contractAddress, betAmount);

      await predictionMarket
        .connect(user2)
        .placePrediction(marketId, false, timestampGuess, betAmount);

      const market = await predictionMarket.getMarket(marketId);
      
      const expectedNoPool = (betAmount * 9000n) / 10000n;
      const expectedBountyPool = (betAmount * 1000n) / 10000n;

      expect(market.yesPool).to.equal(0);
      expect(market.noPool).to.equal(expectedNoPool);
      expect(market.bountyPool).to.equal(expectedBountyPool);
    });

    it("Should balance YES and NO pools correctly", async function () {
      const betAmount1 = parseUSDC("1.0");
      const betAmount2 = parseUSDC("2.0");
      const timestampGuess = deadline + 3600;
      const contractAddress = await predictionMarket.getAddress();

      // Approve USDC
      await mockUSDC.connect(user2).approve(contractAddress, betAmount1);
      await mockUSDC.connect(user3).approve(contractAddress, betAmount2);

      // User2 bets 1 USDC on YES
      await predictionMarket
        .connect(user2)
        .placePrediction(marketId, true, timestampGuess, betAmount1);

      // User3 bets 2 USDC on NO
      await predictionMarket
        .connect(user3)
        .placePrediction(marketId, false, timestampGuess, betAmount2);

      const market = await predictionMarket.getMarket(marketId);
      
      // YES pool: 90% of 1 USDC = 0.9 USDC
      const expectedYesPool = (betAmount1 * 9000n) / 10000n;
      // NO pool: 90% of 2 USDC = 1.8 USDC
      const expectedNoPool = (betAmount2 * 9000n) / 10000n;
      // Bounty pool: 10% of (1 + 2) USDC = 0.3 USDC
      const expectedBountyPool = ((betAmount1 + betAmount2) * 1000n) / 10000n;

      expect(market.yesPool).to.equal(expectedYesPool);
      expect(market.noPool).to.equal(expectedNoPool);
      expect(market.bountyPool).to.equal(expectedBountyPool);
    });

    it("Should reject prediction with zero value", async function () {
      const timestampGuess = deadline + 3600;

      await expect(
        predictionMarket
          .connect(user2)
          .placePrediction(marketId, true, timestampGuess, 0)
      ).to.be.revertedWith("Must bet something");
    });

    it("Should reject prediction after deadline", async function () {
      // Fast forward time past deadline
      await ethers.provider.send("evm_increaseTime", [86400 + 100]);
      await ethers.provider.send("evm_mine", []);

      const timestampGuess = deadline + 3600;
      const betAmount = parseUSDC("1.0");

      await expect(
        predictionMarket
          .connect(user2)
          .placePrediction(marketId, true, timestampGuess, betAmount)
      ).to.be.revertedWith("Betting closed");
    });
  });

  describe("Bounty System", function () {
    let marketId: bigint;
    let deadline: number;

    beforeEach(async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      deadline = (block?.timestamp || Math.floor(Date.now() / 1000)) + 86400;
      const resolutionDate = deadline + 86400;

      await predictionMarket
        .connect(user1)
        .createMarket("Test Market", "Description", deadline, resolutionDate);
      marketId = await predictionMarket.marketCounter();

      // Place some bets
      const betAmount = parseUSDC("1.0");
      const timestampGuess = deadline + 3600;
      const contractAddress = await predictionMarket.getAddress();

      // Approve and place bets
      await mockUSDC.connect(user2).approve(contractAddress, betAmount);
      await mockUSDC.connect(user3).approve(contractAddress, betAmount);

      await predictionMarket
        .connect(user2)
        .placePrediction(marketId, true, timestampGuess, betAmount);

      await predictionMarket
        .connect(user3)
        .placePrediction(marketId, false, timestampGuess, betAmount);

      // Fast forward past deadline
      await ethers.provider.send("evm_increaseTime", [86400 + 100]);
      await ethers.provider.send("evm_mine", []);
    });

    it("Should verify bounty claim as admin", async function () {
      const actualTimestamp = deadline + 1800;

      await expect(
        predictionMarket
          .connect(owner)
          .verifyBountyClaim(marketId, bountyClaimant.address, actualTimestamp)
      )
        .to.emit(predictionMarket, "BountyClaimVerified")
        .withArgs(marketId, bountyClaimant.address, actualTimestamp);

      const market = await predictionMarket.getMarket(marketId);
      expect(market.bountyClaimant).to.equal(bountyClaimant.address);
      expect(market.actualTimestamp).to.equal(actualTimestamp);
    });

    it("Should reject bounty verification from non-admin", async function () {
      const actualTimestamp = deadline + 1800;

      await expect(
        predictionMarket
          .connect(user2)
          .verifyBountyClaim(marketId, bountyClaimant.address, actualTimestamp)
      ).to.be.revertedWith("Only admin");
    });

    it("Should distribute bounty on market resolution", async function () {
      const actualTimestamp = deadline + 1800;
      const initialBalance = await mockUSDC.balanceOf(bountyClaimant.address);

      // Verify bounty claim
      await predictionMarket
        .connect(owner)
        .verifyBountyClaim(marketId, bountyClaimant.address, actualTimestamp);

      // Resolve market
      await predictionMarket
        .connect(owner)
        .resolveMarket(marketId, true, actualTimestamp);

      const finalBalance = await mockUSDC.balanceOf(bountyClaimant.address);
      const market = await predictionMarket.getMarket(marketId);

      // Bounty should be 10% of total bets (2 USDC * 10% = 0.2 USDC)
      const expectedBounty = parseUSDC("0.2");
      expect(finalBalance - initialBalance).to.equal(expectedBounty);
    });
  });

  describe("Market Resolution", function () {
    let marketId: bigint;
    let deadline: number;

    beforeEach(async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      deadline = (block?.timestamp || Math.floor(Date.now() / 1000)) + 86400;
      const resolutionDate = deadline + 86400;

      await predictionMarket
        .connect(user1)
        .createMarket("Test Market", "Description", deadline, resolutionDate);
      marketId = await predictionMarket.marketCounter();

      const contractAddress = await predictionMarket.getAddress();
      const betAmount1 = parseUSDC("1.0");
      const betAmount2 = parseUSDC("2.0");

      // Approve USDC
      await mockUSDC.connect(user2).approve(contractAddress, betAmount1);
      await mockUSDC.connect(user3).approve(contractAddress, betAmount2);

      // User2 bets 1 USDC on YES
      await predictionMarket
        .connect(user2)
        .placePrediction(marketId, true, deadline + 3600, betAmount1);

      // User3 bets 2 USDC on NO
      await predictionMarket
        .connect(user3)
        .placePrediction(marketId, false, deadline + 3600, betAmount2);

      // Fast forward past deadline
      await ethers.provider.send("evm_increaseTime", [86400 + 100]);
      await ethers.provider.send("evm_mine", []);
    });

    it("Should resolve market and distribute winnings to YES winners", async function () {
      const actualTimestamp = deadline + 1800;
      const initialBalance = await mockUSDC.balanceOf(user2.address);

      await expect(
        predictionMarket
          .connect(owner)
          .resolveMarket(marketId, true, actualTimestamp)
      )
        .to.emit(predictionMarket, "MarketResolved")
        .withArgs(marketId, true, actualTimestamp);

      const finalBalance = await mockUSDC.balanceOf(user2.address);
      const market = await predictionMarket.getMarket(marketId);

      expect(market.status).to.equal(2); // Resolved
      expect(market.correctAnswer).to.equal(true);

      // User2 should receive winnings (proportional to their stake)
      expect(finalBalance > initialBalance).to.be.true;
    });

    it("Should resolve market and distribute winnings to NO winners", async function () {
      const actualTimestamp = deadline + 1800;
      const initialBalance = await mockUSDC.balanceOf(user3.address);

      await predictionMarket
        .connect(owner)
        .resolveMarket(marketId, false, actualTimestamp);

      const finalBalance = await mockUSDC.balanceOf(user3.address);

      // User3 should receive winnings
      expect(finalBalance > initialBalance).to.be.true;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle market with no predictions", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const deadline = (block?.timestamp || Math.floor(Date.now() / 1000)) + 86400;
      const resolutionDate = deadline + 86400;

      await predictionMarket
        .connect(user1)
        .createMarket("Test", "Test", deadline, resolutionDate);
      const marketId = await predictionMarket.marketCounter();

      await ethers.provider.send("evm_increaseTime", [86400 + 100]);
      await ethers.provider.send("evm_mine", []);

      // Should resolve without errors even with no predictions
      await expect(
        predictionMarket
          .connect(owner)
          .resolveMarket(marketId, true, deadline + 1800)
      ).to.not.be.reverted;
    });

    it("Should calculate potential payout correctly", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const deadline = (block?.timestamp || Math.floor(Date.now() / 1000)) + 86400;
      const resolutionDate = deadline + 86400;

      await predictionMarket
        .connect(user1)
        .createMarket("Test", "Test", deadline, resolutionDate);
      const marketId = await predictionMarket.marketCounter();

      const contractAddress = await predictionMarket.getAddress();
      const betAmount = parseUSDC("1.0");

      // Approve and place bet
      await mockUSDC.connect(user2).approve(contractAddress, betAmount);
      await predictionMarket
        .connect(user2)
        .placePrediction(marketId, true, deadline + 3600, betAmount);

      // Calculate potential payout for another 1 USDC bet on YES
      const potentialPayout = await predictionMarket.calculatePotentialPayout(
        marketId,
        true,
        betAmount
      );

      expect(potentialPayout).to.be.gt(0);
    });
  });
});
