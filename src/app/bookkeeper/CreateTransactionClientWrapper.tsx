'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import NewTransactionModal from '@/components/bookkeeperComponents/NewTransactionModal';
import {getCustomers} from '@/app/lib/services/crmServices/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/getInteractions';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';

export default function CreateTransactionClientWrapper() {
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [customers, setCustomers] = useState<Customer[] | null>(null);
    const [interactions, setInteractions] = useState<Interaction[] | null>(null);
    const [loading, setLoading] = useState(false);

    // Lazy-load data when modal is opened
    useEffect(() => {
        if (modalOpen && !customers && !interactions) {
            setLoading(true);
            Promise.all([getCustomers(), getInteractions()])
                .then(([custs, ints]) => {
                    setCustomers(custs);
                    setInteractions(ints);
                })
                .finally(() => setLoading(false));
        }
    }, [modalOpen]);

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    return (<>
            <button
                onClick={handleOpenModal}
                className="bg-teal-700 text-white px-4 py-2 rounded shadow-sm hover:bg-teal-600"
            >
                ➕ Add Transaction
            </button>

            {modalOpen && (<>
                    {loading || !customers || !interactions ? (
                        <div className="mt-4 text-gray-500">Loading form data...</div>) : (<NewTransactionModal
                            customers={customers}
                            interactions={interactions}
                            onSuccess={() => {
                                handleCloseModal();
                                router.refresh();
                            }}
                            onClose={handleCloseModal}
                        />)}
                </>)}
        </>);
}
