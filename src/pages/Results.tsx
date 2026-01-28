import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Activity, 
  FileCode, 
  ArrowLeft, 
  Copy, 
  Check,
  Loader2,
  RefreshCw,
  Hash,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoreRing } from '@/components/ScoreRing';
import { MetricCard } from '@/components/MetricCard';
import { FlagItem } from '@/components/FlagItem';
import { BadgeItem } from '@/components/BadgeItem';
import { WalletInput } from '@/components/WalletInput';
import { CompromisePanel } from '@/components/CompromisePanel';
import { calculateReputation, isValidAddress, type ReputationResult } from '@/lib/reputation';
import { analyzeCompromise, type CompromiseResult } from '@/lib/compromise';
import { cn } from '@/lib/utils';

const trustBackgrounds = {
  danger: 'from-score-danger/20 to-transparent',
  caution: 'from-score-caution/20 to-transparent',
  good: 'from-score-good/20 to-transparent',
  excellent: 'from-score-excellent/20 to-transparent',
};

export default function Results() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reputation');
  
  // Reputation state
  const [reputationResult, setReputationResult] = useState<ReputationResult | null>(null);
  const [reputationLoading, setReputationLoading] = useState(true);
  const [reputationError, setReputationError] = useState('');
  
  // Compromise state
  const [compromiseResult, setCompromiseResult] = useState<CompromiseResult | null>(null);
  const [compromiseLoading, setCompromiseLoading] = useState(false);
  const [compromiseError, setCompromiseError] = useState('');
  
  const [copied, setCopied] = useState(false);

  // Fetch reputation on mount
  useEffect(() => {
    async function fetchReputation() {
      if (!address) {
        setReputationError('No address provided');
        setReputationLoading(false);
        return;
      }

      if (!isValidAddress(address)) {
        setReputationError('Invalid wallet address format');
        setReputationLoading(false);
        return;
      }

      try {
        setReputationLoading(true);
        setReputationError('');
        const data = await calculateReputation(address);
        setReputationResult(data);
      } catch (err) {
        setReputationError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
      } finally {
        setReputationLoading(false);
      }
    }

    fetchReputation();
  }, [address]);

  // Fetch compromise analysis when tab changes
  useEffect(() => {
    async function fetchCompromise() {
      if (activeTab !== 'compromise' || !address || !isValidAddress(address)) return;
      if (compromiseResult) return; // Already fetched

      try {
        setCompromiseLoading(true);
        setCompromiseError('');
        const data = await analyzeCompromise(address);
        setCompromiseResult(data);
      } catch (err) {
        setCompromiseError(err instanceof Error ? err.message : 'Failed to analyze wallet');
      } finally {
        setCompromiseLoading(false);
      }
    }

    fetchCompromise();
  }, [activeTab, address, compromiseResult]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    if (activeTab === 'reputation') {
      setReputationLoading(true);
      setReputationResult(null);
      calculateReputation(address!)
        .then(setReputationResult)
        .catch((err) => setReputationError(err.message))
        .finally(() => setReputationLoading(false));
    } else {
      setCompromiseLoading(true);
      setCompromiseResult(null);
      analyzeCompromise(address!)
        .then(setCompromiseResult)
        .catch((err) => setCompromiseError(err.message))
        .finally(() => setCompromiseLoading(false));
    }
  };

  // Initial loading state
  if (reputationLoading && !reputationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing wallet...</p>
          <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
            {address?.slice(0, 10)}...{address?.slice(-8)}
          </p>
        </div>
      </div>
    );
  }

  // Error state (only show if both have errors or initial load failed)
  if (reputationError && !reputationResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{reputationError}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Another Address
          </Button>
        </div>
      </div>
    );
  }

  const result = reputationResult;
  if (!result) return null;

  return (
    <div className="min-h-screen">
      {/* Background gradient based on trust level (only for reputation tab) */}
      {activeTab === 'reputation' && (
        <div 
          className={cn(
            'fixed inset-0 bg-gradient-to-b opacity-50 pointer-events-none transition-opacity duration-500',
            trustBackgrounds[result.trustLevel]
          )} 
        />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
          <p className="font-mono text-lg break-all">{result.address}</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="reputation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Reputation
            </TabsTrigger>
            <TabsTrigger value="compromise" className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Compromise Risk
            </TabsTrigger>
          </TabsList>

          {/* Reputation Tab Content */}
          <TabsContent value="reputation" className="mt-8">
            {/* Score Section */}
            <div className="text-center mb-12">
              <ScoreRing 
                score={result.finalScore} 
                trustLevel={result.trustLevel}
                size={220}
              />
              <h2 className={cn(
                'text-2xl font-bold mt-6',
                result.trustLevel === 'danger' && 'text-score-danger',
                result.trustLevel === 'caution' && 'text-score-caution',
                result.trustLevel === 'good' && 'text-score-good',
                result.trustLevel === 'excellent' && 'text-score-excellent',
              )}>
                {result.trustLabel}
              </h2>
            </div>

            {/* Badges */}
            {result.badges.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">Badges</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.badges.map((badge) => (
                    <BadgeItem key={badge.id} badge={badge} />
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <MetricCard
                icon={Calendar}
                title="Wallet Age"
                value={`${result.metrics.walletAge.days} days`}
                score={result.metrics.walletAge.score}
                maxScore={30}
                description={
                  result.metrics.walletAge.firstTxDate 
                    ? `First tx: ${result.metrics.walletAge.firstTxDate.toLocaleDateString()}`
                    : 'No transactions found'
                }
              />
              <MetricCard
                icon={Hash}
                title="Transactions"
                value={result.metrics.transactions.count.toLocaleString()}
                score={result.metrics.transactions.score}
                maxScore={25}
                description="Total number of transactions"
              />
              <MetricCard
                icon={Activity}
                title="Active Days"
                value={result.metrics.activeDays.count}
                score={result.metrics.activeDays.score}
                maxScore={15}
                description="Unique days with activity"
              />
              <MetricCard
                icon={FileCode}
                title="Contract Interactions"
                value={result.metrics.contractInteractions.count}
                score={result.metrics.contractInteractions.score}
                maxScore={15}
                description="Unique contracts interacted with"
              />
            </div>

            {/* Red Flags */}
            {result.flags.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  ⚠️ Red Flags Detected
                </h3>
                <div className="space-y-2">
                  {result.flags.map((flag) => (
                    <FlagItem key={flag.id} flag={flag} />
                  ))}
                </div>
              </div>
            )}

            {/* Score Breakdown */}
            <div className="glass rounded-xl p-6 mb-10">
              <h3 className="font-medium mb-4">Score Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet Age</span>
                  <span className="font-mono">+{result.metrics.walletAge.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-mono">+{result.metrics.transactions.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Days</span>
                  <span className="font-mono">+{result.metrics.activeDays.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Interactions</span>
                  <span className="font-mono">+{result.metrics.contractInteractions.score}</span>
                </div>
                {result.flags.length > 0 && (
                  <>
                    <div className="border-t border-border my-2" />
                    <div className="flex justify-between text-destructive">
                      <span>Penalties</span>
                      <span className="font-mono">
                        -{result.flags.reduce((sum, f) => sum + f.penalty, 0)}
                      </span>
                    </div>
                  </>
                )}
                <div className="border-t border-border my-2" />
                <div className="flex justify-between font-bold">
                  <span>Final Score</span>
                  <span className="font-mono">{result.finalScore}</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center py-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                ⚠️ This reputation score is for informational purposes only. 
                It should not be used as the sole basis for financial decisions. 
                Always do your own research.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Data fetched at {result.fetchedAt.toLocaleTimeString()}
              </p>
            </div>
          </TabsContent>

          {/* Compromise Risk Tab Content */}
          <TabsContent value="compromise" className="mt-8">
            <CompromisePanel 
              result={compromiseResult}
              isLoading={compromiseLoading}
              error={compromiseError}
            />
          </TabsContent>
        </Tabs>

        {/* Check Another Wallet */}
        <div className="mb-10 mt-10">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Check Another Wallet
          </h3>
          <WalletInput />
        </div>
      </div>
    </div>
  );
}
