"use client";

import { formatUnits, parseUnits } from "viem";
import { base } from "viem/chains";
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ERC20_ABI, getContractAddress, getUSDCAddress, isContractConfigured, PREDICTION_MARKET_ABI } from "../contracts";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

/**
 * Hook to create a new prediction market
 */
export function useCreateBountyMarket() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createBountyMarket = async (
    question: string,
    description: string,
    deadline: number,
    resolutionDate?: number
  ) => {
    if (!isContractConfigured()) {
      throw new Error("Contract not configured");
    }
    
    // Ensure we're on Base mainnet (Chain ID: 8453)
    if (chainId !== base.id) {
      throw new Error(`Please switch to Base mainnet (Chain ID: 8453). Currently on chain ${chainId}`);
    }
    
    const contractAddress = getContractAddress(base.id);
    // Convert timestamps from milliseconds to seconds for contract
    const deadlineInSeconds = Math.floor(deadline / 1000);
    const resolutionInSeconds = resolutionDate 
      ? Math.floor(resolutionDate / 1000)
      : deadlineInSeconds + 86400; // Default: 1 day after deadline

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "createMarket",
      args: [question, description, BigInt(deadlineInSeconds), BigInt(resolutionInSeconds)],
    });
  };

  return {
    createBountyMarket,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to approve USDC spending
 */
export function useApproveUSDC() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approveUSDC = async (amount: number) => {
    if (!isContractConfigured()) {
      throw new Error("Contract not configured");
    }
    
    // Ensure we're on Base mainnet (Chain ID: 8453)
    if (chainId !== base.id) {
      throw new Error(`Please switch to Base mainnet (Chain ID: 8453). Currently on chain ${chainId}`);
    }
    const contractAddress = getContractAddress(base.id);
    const usdcAddress = getUSDCAddress(base.id);
    const amountInUnits = parseUnits(amount.toString(), USDC_DECIMALS);

    writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [contractAddress, amountInUnits],
    });
  };

  return {
    approveUSDC,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to place a prediction (bet) using USDC
 */
export function useContributeToBounty() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const contributeToBounty = async (
    marketId: number, 
    prediction: boolean, // true = YES, false = NO
    timestampGuess: number, // Unix timestamp in ms
    amount: number // USDC amount
  ) => {
    if (!isContractConfigured()) {
      throw new Error("Contract not configured");
    }
    
    // Ensure we're on Base mainnet (Chain ID: 8453)
    if (chainId !== base.id) {
      throw new Error(`Please switch to Base mainnet (Chain ID: 8453). Currently on chain ${chainId}`);
    }
    const contractAddress = getContractAddress(base.id);
    const amountInUnits = parseUnits(amount.toString(), USDC_DECIMALS);
    const timestampInSeconds = Math.floor(timestampGuess / 1000);

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "placePrediction",
      args: [BigInt(marketId), prediction, BigInt(timestampInSeconds), amountInUnits],
    });
  };

  return {
    contributeToBounty,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to verify bounty claim (admin only)
 */
export function useVerifyProof() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const verifyProof = async (marketId: number, claimant: string, actualTimestamp: number) => {
    if (!isContractConfigured()) {
      throw new Error("Contract not configured");
    }
    
    // Ensure we're on Base mainnet (Chain ID: 8453)
    if (chainId !== base.id) {
      throw new Error(`Please switch to Base mainnet (Chain ID: 8453). Currently on chain ${chainId}`);
    }
    const contractAddress = getContractAddress(base.id);
    const timestampInSeconds = Math.floor(actualTimestamp / 1000);

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "verifyBountyClaim",
      args: [BigInt(marketId), claimant as `0x${string}`, BigInt(timestampInSeconds)],
    });
  };

  return {
    verifyProof,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to resolve market (admin only)
 */
export function useResolveWithUMA() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const resolveWithUMA = async (
    marketId: number,
    correctAnswer: boolean, // true = YES won, false = NO won
    actualTimestamp: number
  ) => {
    if (!isContractConfigured()) {
      throw new Error("Contract not configured");
    }
    
    // Ensure we're on Base mainnet (Chain ID: 8453)
    if (chainId !== base.id) {
      throw new Error(`Please switch to Base mainnet (Chain ID: 8453). Currently on chain ${chainId}`);
    }
    const contractAddress = getContractAddress(base.id);
    const timestampInSeconds = Math.floor(actualTimestamp / 1000);

    writeContract({
      address: contractAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "resolveMarket",
      args: [BigInt(marketId), correctAnswer, BigInt(timestampInSeconds)],
    });
  };

  return {
    resolveWithUMA,
    hash,
    isPending: isPending || isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to get user's USDC balance
 */
export function useUSDCBalance() {
  const chainId = useChainId();
  const { address } = useAccount();
  
  // Use Base mainnet (Chain ID: 8453)
  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: isContractConfigured() ? getUSDCAddress(base.id) : undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isContractConfigured() && !!address,
    },
  });

  return {
    balance: balance ? parseFloat(formatUnits(balance as bigint, USDC_DECIMALS)) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check USDC allowance for the contract
 */
export function useUSDCAllowance() {
  const chainId = useChainId();
  const { address } = useAccount();
  
  // Use Base mainnet (Chain ID: 8453)
  const { data: allowance, isLoading, error, refetch } = useReadContract({
    address: isContractConfigured() ? getUSDCAddress(base.id) : undefined,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, getContractAddress(base.id)] : undefined,
    query: {
      enabled: isContractConfigured() && !!address,
    },
  });

  return {
    allowance: allowance ? parseFloat(formatUnits(allowance as bigint, USDC_DECIMALS)) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get user's contribution to a market (placeholder - not directly available)
 */
export function useUserContribution(_marketId: number | null, _userAddress: string | undefined) {
  // The PredictionMarket contract doesn't have a direct contribution mapping
  // Would need to fetch user predictions instead
  return {
    contribution: 0,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook to get contract admin address
 */
export function useContractAdmin() {
  const chainId = useChainId();
  
  // Use Base mainnet (Chain ID: 8453)
  const { data: admin, isLoading, error } = useReadContract({
    address: isContractConfigured() ? getContractAddress(base.id) : undefined,
    abi: PREDICTION_MARKET_ABI,
    functionName: "admin",
    query: {
      enabled: isContractConfigured(),
    },
  });

  return {
    admin: admin as string | undefined,
    isLoading,
    error,
  };
}

// Legacy export for backwards compatibility
export function useSubmitProofToContract() {
  // PredictionMarket doesn't have a submitProof function
  // Proof submission is handled off-chain, then admin calls verifyBountyClaim
  return {
    submitProof: async () => {
      console.warn("Proof submission is handled off-chain. Admin will call verifyBountyClaim.");
    },
    hash: undefined,
    isPending: false,
    isSuccess: false,
    error: null,
  };
}
