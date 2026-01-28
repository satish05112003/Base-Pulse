import { AlertTriangle } from 'lucide-react';
import type { RedFlag } from '@/lib/reputation';

interface FlagItemProps {
  flag: RedFlag;
}

export function FlagItem({ flag }: FlagItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <span className="text-sm">{flag.message}</span>
      </div>
      <span className="text-sm font-bold text-destructive">-{flag.penalty} pts</span>
    </div>
  );
}
