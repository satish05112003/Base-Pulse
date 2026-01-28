import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompromiseSignal } from '@/lib/compromise';

interface SignalItemProps {
  signal: CompromiseSignal;
}

const signalStyles = {
  critical: {
    bg: 'bg-score-danger/10 border-score-danger/30',
    icon: AlertTriangle,
    iconColor: 'text-score-danger',
    badge: 'bg-score-danger/20 text-score-danger',
  },
  warning: {
    bg: 'bg-score-caution/10 border-score-caution/30',
    icon: AlertCircle,
    iconColor: 'text-score-caution',
    badge: 'bg-score-caution/20 text-score-caution',
  },
  info: {
    bg: 'bg-muted/50 border-border',
    icon: Info,
    iconColor: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
  },
};

export function SignalItem({ signal }: SignalItemProps) {
  const styles = signalStyles[signal.type];
  const Icon = styles.icon;

  return (
    <div className={cn('rounded-lg border p-4 transition-all', styles.bg)}>
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg bg-background/50', styles.iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-sm">{signal.title}</h4>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-mono', styles.badge)}>
              +{signal.points} pts
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {signal.message}
          </p>
          
          {signal.details && (
            <p className="text-xs text-muted-foreground/70 mt-2 font-mono">
              {signal.details}
            </p>
          )}
          
          {signal.timestamp && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              {signal.timestamp.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
