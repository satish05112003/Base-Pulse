import { CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationListProps {
  recommendations: string[];
  riskLevel: 'high' | 'medium' | 'low';
}

const levelStyles = {
  high: {
    icon: AlertTriangle,
    iconColor: 'text-score-danger',
    title: 'Immediate Actions Required',
    bg: 'bg-score-danger/5 border-score-danger/20',
  },
  medium: {
    icon: Shield,
    iconColor: 'text-score-caution',
    title: 'Recommended Actions',
    bg: 'bg-score-caution/5 border-score-caution/20',
  },
  low: {
    icon: CheckCircle2,
    iconColor: 'text-score-good',
    title: 'Best Practices',
    bg: 'bg-score-good/5 border-score-good/20',
  },
};

export function RecommendationList({ recommendations, riskLevel }: RecommendationListProps) {
  const styles = levelStyles[riskLevel];
  const Icon = styles.icon;

  return (
    <div className={cn('rounded-xl border p-5', styles.bg)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={cn('w-5 h-5', styles.iconColor)} />
        <h3 className="font-semibold">{styles.title}</h3>
      </div>
      
      <ul className="space-y-2">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground/90">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
