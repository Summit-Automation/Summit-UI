import CreateCustomerClientWrapper from "@/components/crmComponents/CRMActions/CreateCustomerClientWrapper";
import CreateInteractionClientWrapper from "@/components/crmComponents/CRMActions/CreateInteractionClientWrapper";
import { Customer } from '@/types/customer';

export default function CRMActions({ customers }: { customers: Customer[] }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <CreateCustomerClientWrapper />
                <CreateInteractionClientWrapper customers={customers} />
            </div>
        </div>
    );
}