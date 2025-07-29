'use client'    // ← this makes it a Client Component

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import CashFlowArea, { TimeRangeSelector } from '@/components/dashboardComponents/CashFlowArea';
import type { Transaction } from '@/types/transaction';

export default function CashFlowCard({ transactions }: { transactions: Transaction[] }) {
    const [timeRange, setTimeRange] = useState<'7d'|'30d'|'90d'|'all'>('30d');

    return (
        <Card className="chart-container-enhanced card-enhanced bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader className="grid grid-cols-2 items-start pb-3 sm:pb-4">
                {/* COL 1: title + description */}
                <div className="space-y-1 sm:space-y-2">
                    <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                        <div className="p-1.5 bg-slate-800/50 rounded-lg">
                            <Activity className="h-4 w-4 text-green-400 icon-interactive" />
                        </div>
                        Cash Flow
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">
                        Income vs expenses
                    </CardDescription>
                </div>

                {/* COL 2: picker, aligned top right */}
                <div className="justify-self-end">
                    <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
                </div>
            </CardHeader>


            <CardContent className="p-3 sm:p-6 custom-scrollbar">
                <div className="h-48 sm:h-64 lg:h-80">
                    {/* pass the controlled timeRange into your chart */}
                    <div className="w-full">
                    <CashFlowArea transactions={transactions} timeRange={timeRange} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
