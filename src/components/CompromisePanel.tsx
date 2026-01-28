import { Loader2, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { RiskRing } from './RiskRing';
import { SignalItem } from './SignalItem';
import { RecommendationList } from './RecommendationList';
import { cn } from '@/lib/utils';
import type { CompromiseResult } from '@/lib/compromise';

interface CompromisePanelProps {
  result: CompromiseResult | null;
  isLoading: boolean;
  error: string;
}

const riskBackgrounds = {
  high: 'from-score-danger/20 to-transparent',
  medium: 'from-score-caution/20 to-transparent',
  low: 'from-score-good/20 to-transparent',
};

const riskIcons = {
  high: ShieldAlert,
  medium: ShieldQuestion,
  low: ShieldCheck,
};

export function CompromisePanel({ result, isLoading, error }: CompromisePanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing compromise patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const RiskIcon = riskIcons[result.riskLevel];

  return (
    <div className="relative">
      {/* Background gradient based on risk level */}
      <div 
        className={cn(
          'absolute inset-0 bg-gradient-to-b opacity-30 rounded-2xl pointer-events-none -z-10',
          riskBackgrounds[result.riskLevel]
        )} 
      />

      {/* Risk Score Section */}
      <div className="text-center mb-10">
        <RiskRing 
          score={result.riskScore} 
          riskLevel={result.riskLevel}
          size={200}
        />
        
        <div className="flex items-center justify-center gap-2 mt-6">
          <RiskIcon className={cn(
            'w-6 h-6',
            result.riskLevel === 'high' && 'text-score-danger',
            result.riskLevel === 'medium' && 'text-score-caution',
            result.riskLevel === 'low' && 'text-score-good',
          )} />
          <h2 className={cn(
            'text-2xl font-bold',
            result.riskLevel === 'high' && 'text-score-danger',
            result.riskLevel === 'medium' && 'text-score-caution',
            result.riskLevel === 'low' && 'text-score-good',
          )}>
            {result.riskLabel}
          </h2>
        </div>
      </div>

      {/* Detected Signals */}
      {result.signals.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            🚨 Detected Signals ({result.signals.length})
          </h3>
          <div className="space-y-3">
            {result.signals.map((signal) => (
              <SignalItem key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8 text-center py-8 glass rounded-xl">
          <ShieldCheck className="w-12 h-12 text-score-good mx-auto mb-3" />
          <p className="text-muted-foreground">No compromise signals detected</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            This wallet shows no obvious signs of compromise
          </p>
        </div>
      )}

      {/* Score Breakdown */}
      {result.signals.length > 0 && (
        <div className="glass rounded-xl p-6 mb-8">
          <h3 className="font-medium mb-4">Risk Score Breakdown</h3>
          <div className="space-y-2 text-sm">
            {result.signals.map((signal) => (
              <div key={signal.id} className="flex justify-between">
                <span className="text-muted-foreground">{signal.title}</span>
                <span className="font-mono text-score-danger">+{signal.points}</span>
              </div>
            ))}
            <div className="border-t border-border my-2" />
            <div className="flex justify-between font-bold">
              <span>Total Risk Score</span>
              <span className="font-mono">{result.riskScore}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          📋 Recommended Actions
        </h3>
        <RecommendationList 
          recommendations={result.recommendations} 
          riskLevel={result.riskLevel}
        />
      </div>

      {/* Disclaimer */}
      <div className="text-center py-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          ⚠️ This tool analyzes on-chain behavior only. It cannot confirm private key compromise.
          Use as a safety signal, not absolute proof.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          Analysis performed at {result.fetchedAt.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
