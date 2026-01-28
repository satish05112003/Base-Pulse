import { baseClient } from './reputation';
import { type Address } from 'viem';

// Types
export interface CompromiseSignal {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  points: number;
  timestamp?: Date;
  details?: string;
}

export interface CompromiseResult {
  address: string;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  riskLabel: string;
  signals: CompromiseSignal[];
  recommendations: string[];
  fetchedAt: Date;
}

// Risk level classification
function getRiskLevel(score: number): { level: CompromiseResult['riskLevel']; label: string } {
  if (score >= 70) return { level: 'high', label: 'LIKELY COMPROMISED' };
  if (score >= 40) return { level: 'medium', label: 'SUSPICIOUS ACTIVITY' };
  return { level: 'low', label: 'NO STRONG SIGNS' };
}

// Generate recommendations based on risk level
function getRecommendations(riskLevel: CompromiseResult['riskLevel']): string[] {
  switch (riskLevel) {
    case 'high':
      return [
        'Revoke all token approvals immediately',
        'Transfer remaining funds to a new, secure wallet',
        'Create a new wallet with fresh seed phrase',
        'Do NOT sign any new transactions from this wallet',
        'Check for any pending transactions and cancel them',
      ];
    case 'medium':
      return [
        'Review and revoke unnecessary token approvals',
        'Monitor wallet activity closely',
        'Consider moving high-value assets to a new wallet',
        'Enable notifications for wallet transactions',
      ];
    case 'low':
      return [
        'No immediate action required',
        'Continue monitoring wallet activity',
        'Regularly review token approvals as best practice',
      ];
  }
}

// Cache for results
const cache = new Map<string, { result: CompromiseResult; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function analyzeCompromise(address: string): Promise<CompromiseResult> {
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

    // Fetch current balance
    const balance = await baseClient.getBalance({
      address: address as Address,
    });

    const signals: CompromiseSignal[] = [];
    
    // For MVP, we analyze patterns based on available data
    // In production, you'd use an indexer API for full transaction history
    
    // SIGNAL DETECTION (simulated for MVP based on heuristics)
    // Note: Real implementation would require transaction history from an indexer
    
    const hasTransactions = Number(txCount) > 0;
    const hasBalance = balance > 0n;
    const txCountNum = Number(txCount);

    // Detect potential sweep pattern (heuristic for MVP)
    // Wallets with many txs but zero balance could indicate sweep
    if (txCountNum > 10 && !hasBalance) {
      // Check if this looks like a swept wallet
      const sweepLikelihood = Math.min(40, Math.floor(txCountNum / 5) * 5);
      if (sweepLikelihood >= 20) {
        signals.push({
          id: 'potential-sweep',
          type: 'warning',
          title: 'Potential Fund Sweep Detected',
          message: 'Wallet has transaction history but zero balance, which may indicate funds were swept.',
          points: sweepLikelihood,
          details: `${txCountNum} transactions recorded, but current balance is 0 ETH`,
        });
      }
    }

    // Detect high-risk pattern: Many transactions in short existence
    // This is a heuristic - real detection needs full tx history
    if (txCountNum > 100) {
      // Estimate transactions per day (rough heuristic)
      const estimatedDays = Math.max(1, Math.floor(txCountNum / 10));
      const txPerDay = txCountNum / estimatedDays;
      
      if (txPerDay > 20) {
        signals.push({
          id: 'burst-activity',
          type: 'warning',
          title: 'Unusual High-Frequency Activity',
          message: 'Wallet shows patterns of automated or burst transaction activity.',
          points: 20,
          details: `Approximately ${Math.round(txPerDay)} transactions per day average`,
        });
      }
    }

    // Detect dormancy risk (wallet with old activity that stopped)
    // Heuristic: if tx count is moderate but balance is 0
    if (txCountNum >= 5 && txCountNum <= 50 && !hasBalance) {
      signals.push({
        id: 'dormant-empty',
        type: 'info',
        title: 'Dormant After Activity',
        message: 'Wallet shows signs of prior activity but appears dormant with zero balance.',
        points: 10,
        details: 'Activity ceased after funds were removed',
      });
    }

    // NEW WALLET with rapid activity (potential bot behavior)
    if (txCountNum > 50 && txCountNum < 200) {
      // Could indicate scripted activity
      signals.push({
        id: 'scripted-pattern',
        type: 'info',
        title: 'Potentially Scripted Activity',
        message: 'Transaction patterns suggest possible automated usage.',
        points: 10,
        details: `${txCountNum} transactions detected`,
      });
    }

    // Calculate total risk score
    let riskScore = signals.reduce((sum, signal) => sum + signal.points, 0);
    riskScore = Math.max(0, Math.min(100, riskScore));

    const { level, label } = getRiskLevel(riskScore);
    const recommendations = getRecommendations(level);

    const result: CompromiseResult = {
      address,
      riskScore,
      riskLevel: level,
      riskLabel: label,
      signals,
      recommendations,
      fetchedAt: new Date(),
    };

    // Cache the result
    cache.set(normalizedAddress, { result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error('Error analyzing wallet for compromise:', error);
    throw new Error('Failed to analyze wallet. Please check the address and try again.');
  }
}
