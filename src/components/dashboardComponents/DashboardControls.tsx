"use client";

import { Toaster } from '@/components/ui/sonner';
import { FilterSheet } from '@/components/dashboardComponents/dashboardControls/FilterSheet';
import { ExportDialog } from '@/components/dashboardComponents/dashboardControls/ExportDialog';
import { RefreshButton } from '@/components/dashboardComponents/dashboardControls/RefreshButton';

import type { Customer } from '@/types/customer';
import type { Interaction } from '@/types/interaction';
import type { Transaction } from '@/types/transaction';

interface DashboardControlsProps {
    customers:    Customer[];
    interactions: Interaction[];
    transactions: Transaction[];
}

export default function DashboardControls({
                                              customers,
                                              interactions,
                                              transactions,
                                          }: DashboardControlsProps) {
    return (
        <>
            <Toaster position="bottom-right" closeButton />
            <div className="flex gap-3 dashboard-controls">
                <FilterSheet />
                <ExportDialog
                    customers={customers}
                    interactions={interactions}
                    transactions={transactions}
                />
                <RefreshButton />
            </div>
        </>
    );
}