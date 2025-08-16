'use client';

import { cn } from '@/lib/utils';

interface GrowthIndicatorProps {
  value: number;
  showArrow?: boolean;
  className?: string;
}

export function GrowthIndicator({ value, showArrow = true, className }: GrowthIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
      isNeutral 
        ? 'text-slate-400 bg-slate-400/10' 
        : isPositive 
          ? 'text-emerald-400 bg-emerald-400/10' 
          : 'text-red-400 bg-red-400/10',
      className
    )}>
      {showArrow && (
        <span className={isNeutral ? '' : isPositive ? '↗' : '↘'}>
          {isNeutral ? '→' : ''}
        </span>
      )}
      <span>{isPositive ? '+' : ''}{Math.abs(value).toFixed(1)}%</span>
    </div>
  );
}