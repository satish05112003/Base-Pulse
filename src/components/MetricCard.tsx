import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  score: number;
  maxScore: number;
  description?: string;
}

export function MetricCard({ icon: Icon, title, value, score, maxScore, description }: MetricCardProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="glass rounded-xl p-4 transition-all duration-300 hover:border-primary/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">{score}</span>
          <span className="text-xs text-muted-foreground">/{maxScore}</span>
        </div>
      </div>
      
      <p className="text-2xl font-bold mb-2">{value}</p>
      
      {description && (
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
      )}
      
      {/* Progress bar */}
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
