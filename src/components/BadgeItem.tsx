import { cn } from '@/lib/utils';
import type { Badge } from '@/lib/reputation';

interface BadgeItemProps {
  badge: Badge;
}

export function BadgeItem({ badge }: BadgeItemProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-primary/10 border border-primary/20",
        "transition-all duration-300 hover:bg-primary/20 hover:border-primary/30"
      )}
      title={badge.description}
    >
      <span className="text-base">{badge.emoji}</span>
      <span className="text-sm font-medium">{badge.label}</span>
    </div>
  );
}
