export const dynamic = 'force-dynamic';

import { getMileageEntries } from '@/app/lib/services/mileageServices/getMileageEntries';
import MileagePageContent from '@/components/mileageComponents/MileagePageContent';

export default async function MileagePage() {
    const mileageEntries = await getMileageEntries();

    return (
        <MileagePageContent mileageEntries={mileageEntries} />
    );
}