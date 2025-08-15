'use client';

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartProps {
  children: React.ReactElement;
  height?: number;
  mobileHeight?: number;
  className?: string;
}

export function Chart({
  children,
  height = 260,
  mobileHeight = 180,
  className = ''
}: ChartProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartHeight = isMobile ? mobileHeight : height;

  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}