import { createPublicClient, http, type Address } from 'viem';
import { base } from 'viem/chains';

// Create Base mainnet client
export const baseClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// Types
export interface WalletMetrics {
  walletAge: {
    days: number;
    score: number;
    firstTxDate: Date | null;
  };
  transactions: {
    count: number;
    score: number;
  };
  activeDays: {
    count: number;
    score: number;
  };
  contractInteractions: {
    count: number;
    score: number;
    contracts: string[];
  };
}

export interface RedFlag {
  id: string;
  message: string;
  penalty: number;
}

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export interface ReputationResult {
  address: string;
  finalScore: number;
  trustLevel: 'danger' | 'caution' | 'good' | 'excellent';
  trustLabel: string;
  metrics: WalletMetrics;
  flags: RedFlag[];
  badges: Badge[];
  fetchedAt: Date;
}

// Score calculation functions
function calculateWalletAgeScore(days: number): number {
  if (days < 7) return 0;
  if (days <= 30) return 10;
  if (days <= 180) return 20;
  return 30;
}

function calculateTransactionScore(count: number): number {
  if (count < 5) return 5;
  if (count <= 50) return 15;
  if (count <= 300) return 22;
  return 25;
}

function calculateActiveDaysScore(days: number): number {
  if (days <= 1) return 0;
  if (days <= 7) return 7;
  if (days <= 30) return 12;
  return 15;
}

function calculateContractScore(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 8;
  if (count <= 10) return 12;
  return 15;
}

function detectRedFlags(
  metrics: WalletMetrics,
  txTimestamps: Date[]
): RedFlag[] {
  const flags: RedFlag[] = [];

  // Flag: Wallet created and tx on same day
  if (metrics.walletAge.days === 0 && metrics.transactions.count > 0) {
    flags.push({
      id: 'same-day-creation',
      message: 'Wallet created and active on same day',
      penalty: 10,
    });
  }

  // Flag: Only 1 contract used
  if (metrics.contractInteractions.count === 1 && metrics.transactions.count > 5) {
    flags.push({
      id: 'single-contract',
      message: 'Only interacted with 1 contract',
      penalty: 5,
    });
  }

  // Flag: No activity after first week
  if (metrics.walletAge.days > 30 && txTimestamps.length > 0) {
    const firstTx = txTimestamps[0];
    const lastTx = txTimestamps[txTimestamps.length - 1];
    const firstWeekEnd = new Date(firstTx.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (lastTx < firstWeekEnd && metrics.walletAge.days > 7) {
      flags.push({
        id: 'dormant-after-week',
        message: 'No activity after first week',
        penalty: 10,
      });
    }
  }

  return flags;
}

function assignBadges(metrics: WalletMetrics, flags: RedFlag[]): Badge[] {
  const badges: Badge[] = [];

  // Old Wallet badge
  if (metrics.walletAge.days > 180) {
    badges.push({
      id: 'old-wallet',
      emoji: '🏆',
      label: 'Old Wallet',
      description: 'Wallet is over 6 months old',
    });
  }

  // Fresh Wallet badge
  if (metrics.walletAge.days <= 7) {
    badges.push({
      id: 'fresh-wallet',
      emoji: '🌱',
      label: 'Fresh Wallet',
      description: 'Wallet is less than a week old',
    });
  }

  // Consistent Activity badge
  if (metrics.activeDays.count > 30) {
    badges.push({
      id: 'consistent-activity',
      emoji: '⚡',
      label: 'Consistent Activity',
      description: 'Active on more than 30 different days',
    });
  }

  // Power User badge
  if (metrics.transactions.count > 300) {
    badges.push({
      id: 'power-user',
      emoji: '🚀',
      label: 'Power User',
      description: 'Over 300 transactions',
    });
  }

  // DeFi Explorer badge
  if (metrics.contractInteractions.count > 10) {
    badges.push({
      id: 'defi-explorer',
      emoji: '🔮',
      label: 'DeFi Explorer',
      description: 'Interacted with 10+ contracts',
    });
  }

  // Dormant Wallet badge
  const hasDormantFlag = flags.some(f => f.id === 'dormant-after-week');
  if (hasDormantFlag) {
    badges.push({
      id: 'dormant',
      emoji: '😴',
      label: 'Dormant Wallet',
      description: 'No recent activity',
    });
  }

  return badges;
}

function getTrustLevel(score: number): { level: ReputationResult['trustLevel']; label: string } {
  if (score <= 30) return { level: 'danger', label: 'High Risk' };
  if (score <= 60) return { level: 'caution', label: 'Proceed with Caution' };
  if (score <= 85) return { level: 'good', label: 'Trusted' };
  return { level: 'excellent', label: 'Highly Trusted' };
}

// Cache for results
const cache = new Map<string, { result: ReputationResult; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function calculateReputation(address: string): Promise<ReputationResult> {
  const normalizedAddress = address.toLowerCase();
  
  // Check cache
  const cached = cache.get(normalizedAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  try {
    // Fetch transaction count
    const txCount = await baseClient.getTransactionCount({
      address: address as Address,
    });

    // For MVP, we'll use the transaction count and estimate other metrics
    // In production, you'd use an indexer API like Etherscan or BlockScout
    
    // Fetch the latest block to estimate wallet age
    const latestBlock = await baseClient.getBlockNumber();
    
    // Estimate metrics based on transaction count
    // This is a simplified version - in production you'd fetch actual tx history
    const estimatedDays = Math.min(Math.floor(txCount / 2), 365); // Rough estimate
    const estimatedActiveDays = Math.min(Math.floor(txCount / 5), estimatedDays);
    const estimatedContracts = Math.min(Math.floor(txCount / 10) + 1, 15);

    const metrics: WalletMetrics = {
      walletAge: {
        days: estimatedDays,
        score: calculateWalletAgeScore(estimatedDays),
        firstTxDate: estimatedDays > 0 ? new Date(Date.now() - estimatedDays * 24 * 60 * 60 * 1000) : null,
      },
      transactions: {
        count: Number(txCount),
        score: calculateTransactionScore(Number(txCount)),
      },
      activeDays: {
        count: estimatedActiveDays,
        score: calculateActiveDaysScore(estimatedActiveDays),
      },
      contractInteractions: {
        count: estimatedContracts,
        score: calculateContractScore(estimatedContracts),
        contracts: [],
      },
    };

    // For MVP, generate mock timestamps based on estimates
    const txTimestamps: Date[] = [];
    if (metrics.walletAge.firstTxDate) {
      txTimestamps.push(metrics.walletAge.firstTxDate);
      if (txCount > 1) {
        txTimestamps.push(new Date());
      }
    }

    const flags = detectRedFlags(metrics, txTimestamps);
    const badges = assignBadges(metrics, flags);

    // Calculate final score
    const totalPenalty = flags.reduce((sum, flag) => sum + flag.penalty, 0);
    const rawScore = 
      metrics.walletAge.score +
      metrics.transactions.score +
      metrics.activeDays.score +
      metrics.contractInteractions.score -
      totalPenalty;

    const finalScore = Math.max(0, Math.min(100, rawScore));
    const { level, label } = getTrustLevel(finalScore);

    const result: ReputationResult = {
      address,
      finalScore,
      trustLevel: level,
      trustLabel: label,
      metrics,
      flags,
      badges,
      fetchedAt: new Date(),
    };

    // Cache the result
    cache.set(normalizedAddress, { result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    throw new Error('Failed to fetch wallet data. Please check the address and try again.');
  }
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
