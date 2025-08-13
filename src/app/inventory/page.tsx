export const dynamic = 'force-dynamic';

import { getInventoryItems } from '@/app/lib/services/inventoryServices/getInventoryItems';
import { getInventoryAlerts } from '@/app/lib/services/inventoryServices/getInventoryAlerts';
import InventoryPageContent from '@/components/inventoryComponents/InventoryPageContent';

export default async function InventoryPage() {
    const items = await getInventoryItems();
    const alerts = await getInventoryAlerts();

    return (
        <InventoryPageContent 
            initialItems={items} 
            initialAlerts={alerts} 
        />
    );
}