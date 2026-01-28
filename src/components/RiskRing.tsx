import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RiskRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  riskLevel: 'high' | 'medium' | 'low';
}

const riskColors = {
  high: {
    stroke: 'stroke-score-danger',
    glow: 'glow-red animate-pulse-glow',
    text: 'text-score-danger',
  },
  medium: {
    stroke: 'stroke-score-caution',
    glow: 'glow-orange',
    text: 'text-score-caution',
  },
  low: {
    stroke: 'stroke-score-good',
    glow: 'glow-green',
    text: 'text-score-good',
  },
};

export function RiskRing({ score, size = 200, strokeWidth = 12, riskLevel }: RiskRingProps) {
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

  const colors = riskColors[riskLevel];

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
      
      {/* Animated risk ring */}
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

      {/* Risk score text */}
      <div className="relative z-10 text-center">
        <span className={cn('text-5xl font-bold tabular-nums', colors.text)}>
          {Math.round(animatedScore)}
        </span>
        <p className="text-sm text-muted-foreground mt-1">Risk Score</p>
      </div>
    </div>
  );
}
