import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  trustLevel: 'danger' | 'caution' | 'good' | 'excellent';
}

const trustColors = {
  danger: {
    stroke: 'stroke-score-danger',
    glow: 'glow-red',
    text: 'text-score-danger',
  },
  caution: {
    stroke: 'stroke-score-caution',
    glow: 'glow-orange',
    text: 'text-score-caution',
  },
  good: {
    stroke: 'stroke-score-good',
    glow: 'glow-green',
    text: 'text-score-good',
  },
  excellent: {
    stroke: 'stroke-score-excellent',
    glow: 'glow-green animate-pulse-glow',
    text: 'text-score-excellent',
  },
};

export function ScoreRing({ score, size = 200, strokeWidth = 12, trustLevel }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const colors = trustColors[trustLevel];

  return (
    <div className={cn('relative inline-flex items-center justify-center', colors.glow)} style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
      </svg>
      
      {/* Animated score ring */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(colors.stroke, 'transition-all duration-1000 ease-out')}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      {/* Score text */}
      <div className="relative z-10 text-center">
        <span className={cn('text-5xl font-bold tabular-nums', colors.text)}>
          {Math.round(animatedScore)}
        </span>
        <p className="text-sm text-muted-foreground mt-1">/ 100</p>
      </div>
    </div>
  );
}
