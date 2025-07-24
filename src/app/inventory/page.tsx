export const dynamic = 'force-dynamic';

import InventoryClientWrapper from '@/components/inventoryComponents/InventoryClientWrapper';
import { getInventoryItems } from '@/app/lib/services/inventoryServices/getInventoryItems';
import { getInventoryAlerts } from '@/app/lib/services/inventoryServices/getInventoryAlerts';

export default async function InventoryPage() {
    const items = await getInventoryItems();
    const alerts = await getInventoryAlerts();

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="data-appear">
                <h2 className="text-3xl font-bold text-gradient">Inventory Management</h2>
                <p className="text-slate-400 mt-2">Track stock levels, manage items, and automate reordering</p>
            </div>

            {/* Pass initial data to client wrapper for filtering and state management */}
            <InventoryClientWrapper initialItems={items} initialAlerts={alerts} />
        </div>
    );
}