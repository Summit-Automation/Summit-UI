'use client';

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileChartProps {
  title?: string;
  description?: string;
  children: React.ReactElement;
  className?: string;
  allowFullscreen?: boolean;
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
  allowFullscreen = true,
  defaultHeight = 350,
  mobileHeight = 250,
  standalone = false
}: MobileChartProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const height = isMobile ? mobileHeight : defaultHeight;

  const chartContent = (
    <div className="relative">
      {allowFullscreen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-2 right-2 z-10 bg-slate-800/50 hover:bg-slate-700/50"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <ResponsiveContainer 
        width="100%" 
        height={isFullscreen ? '80vh' : height}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl max-h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
          {title && (
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold">{title}</h3>
              {description && (
                <p className="text-slate-400 text-sm">{description}</p>
              )}
            </div>
          )}
          {chartContent}
        </div>
      </div>
    );
  }

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