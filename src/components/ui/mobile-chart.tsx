'use client';

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface MobileChartProps {
  title?: string;
  description?: string;
  children: React.ReactElement;
  className?: string;
  defaultHeight?: number;
  mobileHeight?: number;
  standalone?: boolean; // New prop to determine if this should wrap in a card
}

interface TooltipPayloadItem {
    value: unknown;
    dataKey: string;
    color: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    formatter?: (value: unknown) => string;
    labelFormatter?: (label: string) => string;
}

interface LegendPayloadItem {
    value: string;
    color: string;
}

interface LegendProps {
    payload?: LegendPayloadItem[];
}

export function MobileChart({
  title,
  description,
  children,
  className,
  defaultHeight = 350,
  mobileHeight = 250,
  standalone = false
}: MobileChartProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const height = isMobile ? mobileHeight : defaultHeight;

  const chartContent = (
    <ResponsiveContainer 
      width="100%" 
      height={height}
    >
      {children}
    </ResponsiveContainer>
  );

  // If standalone is false, just return the chart content without wrapping
  if (!standalone) {
    return chartContent;
  }

  // If standalone is true, wrap in a card (for truly standalone charts)
  return (
    <div className={cn("bg-slate-900/50 border border-slate-800 rounded-lg", className)}>
      {title && (
        <div className="p-4 pb-2">
          <h3 className="text-white text-base sm:text-lg font-semibold">
            {title}
          </h3>
          {description && (
            <p className="text-slate-400 text-xs sm:text-sm">{description}</p>
          )}
        </div>
      )}
      <div className="p-3 sm:p-6">
        {chartContent}
      </div>
    </div>
  );
}

// Custom tooltip component for mobile-friendly tooltips
export function MobileTooltip({ 
  active, 
  payload, 
  label,
  formatter,
  labelFormatter 
}: TooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg max-w-xs">
      {label && (
        <p className="text-slate-300 text-sm font-medium mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry: TooltipPayloadItem, index: number) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-400 text-xs">{entry.dataKey}:</span>
            </div>
            <span className="text-slate-100 text-xs font-medium">
              {formatter ? formatter(entry.value) : String(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile-optimized legend
export function MobileLegend({ payload }: LegendProps) {
  if (!payload || !payload.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4 px-2">
      {payload.map((entry: LegendPayloadItem, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300 text-xs">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}