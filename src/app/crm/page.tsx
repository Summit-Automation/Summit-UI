// app/crm/page.tsx
import { Customer } from '@/types/customer';
import { Interaction } from "@/types/interaction";
import { getCustomers } from './getCustomers';
import { getInteractions } from "@/app/crm/getInteractions";
import CustomerRow from './CustomerRow';

export default async function CRMPage() {
    const [customers, interactions] = await Promise.all([
        getCustomers(),
        getInteractions(),
    ]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Customer Relationship Manager</h2>

            {customers.length === 0 ? (
                <p className="text-gray-500 italic">No customers found.</p>
            ) : (
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-slate-700 text-slate-100">
                    <tr>
                        <th className="text-left p-2 border">Name</th>
                        <th className="text-left p-2 border">Business</th>
                        <th className="text-left p-2 border">Email</th>
                        <th className="text-left p-2 border">Phone</th>
                        <th className="text-left p-2 border">Status</th>
                        <th className="text-left p-2 border">Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {customers.map((customer) => (
                        <CustomerRow
                            key={customer.id}
                            customer={customer}
                            interactions={interactions.filter(
                                interaction => interaction.customer_id === customer.id
                            )}
                        />
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
