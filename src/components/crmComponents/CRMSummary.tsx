import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';

export default function CRMSummary({
                                       customers, interactions,
                                   }: {
    customers: Customer[]; interactions: Interaction[];
}) {
    const totalCustomers = customers.length;
    const totalInteractions = interactions.length;

    return (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-sky-800 text-white rounded-lg p-4 shadow border border-sky-200">
                <h3 className="text-lg font-semibold">Total Customers</h3>
                <p className="text-2xl font-bold">{totalCustomers}</p>
            </div>
            <div className="bg-indigo-700 text-white rounded-lg p-4 shadow border border-indigo-200">
                <h3 className="text-lg font-semibold">Interactions Logged</h3>
                <p className="text-2xl font-bold">{totalInteractions}</p>
            </div>
            <div className="bg-slate-700 text-white rounded-lg p-4 shadow border border-slate-300">
                <h3 className="text-lg font-semibold">Avg. Interactions / Customer</h3>
                <p className="text-2xl font-bold">
                    {totalCustomers > 0 ? (totalInteractions / totalCustomers).toFixed(1) : '0.0'}
                </p>
            </div>
        </div>);
}
