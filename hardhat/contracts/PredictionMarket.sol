// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PredictionMarket
 * @notice A prediction market contract on Base with bounty rewards for event makers
 * @dev Uses USDC for all transactions. Distributes: 90% to winners, 10% to person who made event happen
 */
contract PredictionMarket {
    using SafeERC20 for IERC20;

    // USDC token address (set in constructor)
    IERC20 public immutable usdc;

    // Market structure
    struct Market {
        uint256 id;
        string question;
        string description;
        address creator;           // Market creator address
        uint256 deadline;          // When betting closes
        uint256 resolutionDate;    // Expected resolution time
        uint256 yesPool;           // Total USDC bet on YES (90% of bets)
        uint256 noPool;            // Total USDC bet on NO (90% of bets)
        uint256 bountyPool;        // 10% of all bets - goes to person who made event happen
        MarketStatus status;
        bool correctAnswer;        // true = YES, false = NO
        uint256 actualTimestamp;   // Actual event timestamp when resolved
        address bountyClaimant;    // Address of person who made event happen (set after verification)
        uint256 createdAt;
    }

    // Prediction structure
    struct Prediction {
        uint256 id;
        uint256 marketId;
        address user;
        bool prediction;           // true = YES, false = NO
        uint256 amount;
        uint256 timestampGuess;
        uint256 createdAt;
    }

    enum MarketStatus {
        Active,
        Closed,
        Resolved
    }

    // State variables
    uint256 public marketCounter;
    uint256 public predictionCounter;
    
    // Pool distribution (basis points)
    uint256 public constant BOUNTY_FEE_BPS = 1000; // 10% to bounty pool
    uint256 public constant PREDICTION_POOL_BPS = 9000; // 90% to yes/no pools
    
    // Admin address for verifying proof submissions (can be set)
    address public admin;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Prediction[]) public marketPredictions;
    mapping(uint256 => mapping(address => Prediction[])) public userPredictions;
    
    // Proof submissions (off-chain verification, on-chain claim)
    mapping(uint256 => address) public pendingBountyClaims; // marketId => claimant address
    
    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        uint256 deadline
    );
    
    event PredictionPlaced(
        uint256 indexed marketId,
        uint256 indexed predictionId,
        address indexed user,
        bool prediction,
        uint256 amount,
        uint256 timestampGuess
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool correctAnswer,
        uint256 actualTimestamp
    );
    
    event WinningsDistributed(
        uint256 indexed marketId,
        address indexed winner,
        uint256 amount,
        string reason // "winner", "bounty"
    );
    
    event BountyClaimVerified(
        uint256 indexed marketId,
        address indexed claimant,
        uint256 actualTimestamp
    );

    /**
     * @notice Create a new prediction market
     * @param question The market question
     * @param description Additional context
     * @param deadline When betting closes (unix timestamp)
     * @param resolutionDate Expected resolution time (unix timestamp)
     */
    function createMarket(
        string memory question,
        string memory description,
        uint256 deadline,
        uint256 resolutionDate
    ) external returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be in future");
        require(resolutionDate > deadline, "Resolution must be after deadline");
        
        marketCounter++;
        uint256 marketId = marketCounter;
        
        markets[marketId] = Market({
            id: marketId,
            question: question,
            description: description,
            creator: msg.sender,
            deadline: deadline,
            resolutionDate: resolutionDate,
            yesPool: 0,
            noPool: 0,
            bountyPool: 0,
            status: MarketStatus.Active,
            correctAnswer: false,
            actualTimestamp: 0,
            bountyClaimant: address(0),
            createdAt: block.timestamp
        });
        
        emit MarketCreated(marketId, msg.sender, question, deadline);
        return marketId;
    }

    /**
     * @notice Place a prediction on a market using USDC
     * @param marketId The market ID
     * @param prediction true for YES, false for NO
     * @param timestampGuess Unix timestamp guess for when event resolves
     * @param amount Amount of USDC to bet (must approve contract first)
     */
    function placePrediction(
        uint256 marketId,
        bool prediction,
        uint256 timestampGuess,
        uint256 amount
    ) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp < market.deadline, "Betting closed");
        require(amount > 0, "Must bet something");
        require(timestampGuess > market.deadline, "Timestamp must be after deadline");
        
        // Transfer USDC from user to contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        predictionCounter++;
        uint256 predictionId = predictionCounter;
        
        // Calculate pool distribution: 90% to prediction, 10% to bounty
        uint256 bountyAmount = (amount * BOUNTY_FEE_BPS) / 10000;
        uint256 predictionAmount = (amount * PREDICTION_POOL_BPS) / 10000;
        
        // Update pools
        market.bountyPool += bountyAmount;
        
        // Add to YES or NO pool (balanced approach)
        if (prediction) {
            market.yesPool += predictionAmount;
        } else {
            market.noPool += predictionAmount;
        }
        
        // Store prediction
        Prediction memory newPrediction = Prediction({
            id: predictionId,
            marketId: marketId,
            user: msg.sender,
            prediction: prediction,
            amount: amount,
            timestampGuess: timestampGuess,
            createdAt: block.timestamp
        });
        
        marketPredictions[marketId].push(newPrediction);
        userPredictions[marketId][msg.sender].push(newPrediction);
        
        emit PredictionPlaced(
            marketId,
            predictionId,
            msg.sender,
            prediction,
            amount,
            timestampGuess
        );
    }

    /**
     * @notice Admin verifies proof and approves bounty claim
     * @param marketId The market ID
     * @param claimant The address of the person who made the event happen
     * @param actualTimestamp The actual timestamp when the event occurred (from their proof)
     */
    function verifyBountyClaim(
        uint256 marketId,
        address claimant,
        uint256 actualTimestamp
    ) external onlyAdmin {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp >= market.deadline, "Market still active");
        require(claimant != address(0), "Invalid claimant");
        require(actualTimestamp > market.deadline, "Timestamp must be after deadline");
        
        // Set the bounty claimant and actual timestamp
        market.bountyClaimant = claimant;
        market.actualTimestamp = actualTimestamp;
        pendingBountyClaims[marketId] = claimant;
        
        emit BountyClaimVerified(marketId, claimant, actualTimestamp);
    }
    
    /**
     * @notice Resolve a market and distribute winnings in USDC
     * @param marketId The market ID
     * @param correctAnswer true if YES won, false if NO won
     * @param actualTimestamp The actual timestamp when the event occurred
     */
    function resolveMarket(
        uint256 marketId,
        bool correctAnswer,
        uint256 actualTimestamp
    ) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp >= market.deadline, "Market still active");
        
        market.status = MarketStatus.Resolved;
        market.correctAnswer = correctAnswer;
        // actualTimestamp is set during verifyBountyClaim, use provided value if not set
        if (market.actualTimestamp == 0) {
            market.actualTimestamp = actualTimestamp;
        }
        
        // Distribute bounty pool to person who made event happen
        // The bounty claimant is the person who submitted proof and made the event happen
        // They get the entire 10% bounty pool
        if (market.bountyClaimant != address(0) && market.bountyPool > 0) {
            usdc.safeTransfer(market.bountyClaimant, market.bountyPool);
            emit WinningsDistributed(marketId, market.bountyClaimant, market.bountyPool, "bounty");
        }
        
        // Distribute winnings to correct side
        uint256 winningPool = correctAnswer ? market.yesPool : market.noPool;
        if (winningPool > 0) {
            distributeWinnerPayouts(marketId, correctAnswer, winningPool);
        }
        
        emit MarketResolved(marketId, correctAnswer, actualTimestamp);
    }


    /**
     * @notice Distribute winnings proportionally to winners in USDC
     */
    function distributeWinnerPayouts(
        uint256 marketId,
        bool correctAnswer,
        uint256 totalPool
    ) internal {
        Prediction[] memory predictions = marketPredictions[marketId];
        uint256 totalWinningBets = 0;
        
        // Calculate total winning bets (90% of each bet goes to pools)
        for (uint256 i = 0; i < predictions.length; i++) {
            if (predictions[i].prediction == correctAnswer) {
                uint256 betAmount = predictions[i].amount;
                uint256 netBet = (betAmount * PREDICTION_POOL_BPS) / 10000; // 90% of bet
                totalWinningBets += netBet;
            }
        }
        
        if (totalWinningBets == 0) return;
        
        // Distribute proportionally to winners
        for (uint256 i = 0; i < predictions.length; i++) {
            if (predictions[i].prediction == correctAnswer) {
                uint256 betAmount = predictions[i].amount;
                uint256 netBet = (betAmount * PREDICTION_POOL_BPS) / 10000; // 90% of bet
                
                uint256 payout = (totalPool * netBet) / totalWinningBets;
                usdc.safeTransfer(predictions[i].user, payout);
                emit WinningsDistributed(marketId, predictions[i].user, payout, "winner");
            }
        }
    }

    /**
     * @notice Get market details
     */
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }
    
    /**
     * @notice Set admin address (for proof verification)
     */
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        admin = newAdmin;
    }

    /**
     * @notice Get all predictions for a market
     */
    function getMarketPredictions(uint256 marketId) external view returns (Prediction[] memory) {
        return marketPredictions[marketId];
    }

    /**
     * @notice Get user's predictions for a market
     */
    function getUserPredictions(uint256 marketId, address user) external view returns (Prediction[] memory) {
        return userPredictions[marketId][user];
    }

    /**
     * @notice Calculate potential payout for a prediction
     */
    function calculatePotentialPayout(
        uint256 marketId,
        bool prediction,
        uint256 amount
    ) external view returns (uint256) {
        Market memory market = markets[marketId];
        uint256 currentPool = prediction ? market.yesPool : market.noPool;
        uint256 opposingPool = prediction ? market.noPool : market.yesPool;
        
        uint256 netBet = (amount * PREDICTION_POOL_BPS) / 10000; // 90% of bet
        
        if (currentPool == 0) return 0;
        
        uint256 newPool = currentPool + netBet;
        uint256 share = (netBet * 1e18) / newPool;
        uint256 totalWinnings = ((currentPool + opposingPool + netBet) * share) / 1e18;
        
        return totalWinnings;
    }
}
