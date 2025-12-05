// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BountyMarket
 * @notice Bounty contract on Base that can link to Polymarket markets
 * @dev Handles bounty pools, proof submission, and UMA-based resolution
 */
contract BountyMarket {
    struct BountyMarket {
        uint256 id;
        string polymarketId;      // Optional: Polymarket market ID if linked
        string question;
        uint256 deadline;
        uint256 bountyPool;
        address bountyClaimant;    // Set after proof verification
        MarketStatus status;
        uint256 createdAt;
    }

    enum MarketStatus {
        Active,
        Closed,
        Resolved
    }

    // State
    uint256 public marketCounter;
    address public admin;
    address public umaOracle;     // UMA Optimistic Oracle address
    
    mapping(uint256 => BountyMarket) public markets;
    mapping(uint256 => mapping(address => uint256)) public contributions; // marketId => user => amount
    mapping(uint256 => string) public proofHashes; // marketId => IPFS hash of proof
    
    // UMA integration
    mapping(uint256 => bytes32) public umaRequests; // marketId => UMA request ID
    
    event BountyMarketCreated(
        uint256 indexed marketId,
        string polymarketId,
        string question
    );
    
    event BountyContributed(
        uint256 indexed marketId,
        address indexed contributor,
        uint256 amount
    );
    
    event ProofSubmitted(
        uint256 indexed marketId,
        address indexed submitter,
        string proofHash
    );
    
    event ProofVerified(
        uint256 indexed marketId,
        address indexed claimant
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        address indexed bountyClaimant,
        uint256 bountyAmount
    );

    constructor(address _umaOracle) {
        admin = msg.sender;
        umaOracle = _umaOracle;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    /**
     * @notice Create a bounty market (can link to Polymarket)
     * @param polymarketId Optional Polymarket market ID (empty string if not linked)
     * @param question Market question
     * @param deadline When betting closes
     */
    function createBountyMarket(
        string memory polymarketId,
        string memory question,
        uint256 deadline
    ) external returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be in future");
        
        marketCounter++;
        uint256 marketId = marketCounter;
        
        markets[marketId] = BountyMarket({
            id: marketId,
            polymarketId: polymarketId,
            question: question,
            deadline: deadline,
            bountyPool: 0,
            bountyClaimant: address(0),
            status: MarketStatus.Active,
            createdAt: block.timestamp
        });
        
        emit BountyMarketCreated(marketId, polymarketId, question);
        return marketId;
    }

    /**
     * @notice Contribute to bounty pool
     * @param marketId The market ID
     */
    function contributeToBounty(uint256 marketId) external payable {
        BountyMarket storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp < market.deadline, "Deadline passed");
        require(msg.value > 0, "Must contribute something");
        
        market.bountyPool += msg.value;
        contributions[marketId][msg.sender] += msg.value;
        
        emit BountyContributed(marketId, msg.sender, msg.value);
    }

    /**
     * @notice Submit proof that you made the event happen
     * @param marketId The market ID
     * @param proofHash IPFS hash of the proof image
     */
    function submitProof(
        uint256 marketId,
        string memory proofHash
    ) external {
        BountyMarket storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp >= market.deadline, "Deadline not passed");
        require(bytes(proofHash).length > 0, "Invalid proof hash");
        
        proofHashes[marketId] = proofHash;
        
        emit ProofSubmitted(marketId, msg.sender, proofHash);
    }

    /**
     * @notice Admin verifies proof and sets bounty claimant
     * @param marketId The market ID
     * @param claimant Address of person who made event happen
     */
    function verifyProof(
        uint256 marketId,
        address claimant
    ) external onlyAdmin {
        BountyMarket storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(claimant != address(0), "Invalid claimant");
        require(bytes(proofHashes[marketId]).length > 0, "No proof submitted");
        
        market.bountyClaimant = claimant;
        market.status = MarketStatus.Closed;
        
        emit ProofVerified(marketId, claimant);
    }

    /**
     * @notice Resolve market using UMA result
     * @param marketId The market ID
     * @param umaRequestId UMA request ID for this market
     * @param outcome The resolved outcome (true = YES, false = NO)
     */
    function resolveWithUMA(
        uint256 marketId,
        bytes32 umaRequestId,
        bool outcome
    ) external {
        // In production, verify this comes from UMA oracle
        // For hackathon, we can use a simpler verification
        require(msg.sender == umaOracle || msg.sender == admin, "Unauthorized");
        
        BountyMarket storage market = markets[marketId];
        require(
            market.status == MarketStatus.Closed || market.status == MarketStatus.Active,
            "Market already resolved"
        );
        
        market.status = MarketStatus.Resolved;
        umaRequests[marketId] = umaRequestId;
        
        // Distribute bounty if outcome is YES and claimant is set
        if (outcome && market.bountyClaimant != address(0) && market.bountyPool > 0) {
            (bool success, ) = market.bountyClaimant.call{value: market.bountyPool}("");
            require(success, "Bounty payout failed");
            
            emit MarketResolved(marketId, market.bountyClaimant, market.bountyPool);
        } else if (market.bountyPool > 0) {
            // If outcome is NO or no claimant, refund contributors proportionally
            // For simplicity, refund to admin (can be improved)
            (bool success, ) = admin.call{value: market.bountyPool}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice Get market details
     */
    function getMarket(uint256 marketId) external view returns (BountyMarket memory) {
        return markets[marketId];
    }

    /**
     * @notice Set UMA oracle address
     */
    function setUMAOracle(address _umaOracle) external onlyAdmin {
        require(_umaOracle != address(0), "Invalid address");
        umaOracle = _umaOracle;
    }

    /**
     * @notice Set admin address
     */
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        admin = newAdmin;
    }
}

