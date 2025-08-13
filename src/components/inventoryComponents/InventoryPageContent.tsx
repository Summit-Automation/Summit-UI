'use client';

import { useRouter } from 'next/navigation';
import {Header} from '@/components/globalComponents/Header';
import InventoryClientWrapper from '@/components/inventoryComponents/InventoryClientWrapper';

import type { InventoryItem, InventoryAlert } from '@/types/inventory';

interface InventoryPageContentProps {
    initialItems: InventoryItem[];
    initialAlerts: InventoryAlert[];
}

export default function InventoryPageContent({ initialItems, initialAlerts }: InventoryPageContentProps) {
    const router = useRouter();

    const handleNotifications = () => router.push('/?tab=notifications');
    const handleSettings = () => router.push('/settings');
    const handleHelp = () => router.push('/?tab=help');

    return (
        <div className="space-y-6">
            {/* Modern Mercury-style Header */}
            <Header 
                title="Inventory Management"
                subtitle="Track stock levels, manage items, and automate reordering"
                onNotifications={handleNotifications}
                onSettings={handleSettings}
                onHelp={handleHelp}
            />

            <div className="px-4 lg:px-6">
                {/* Pass initial data to client wrapper for filtering and state management */}
                <InventoryClientWrapper initialItems={initialItems} initialAlerts={initialAlerts} />
            </div>
        </div>
    );
}