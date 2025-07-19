import CreateCustomerClientWrapper from "@/components/crmComponents/CRMActions/CreateCustomerClientWrapper";
import CreateInteractionClientWrapper from "@/components/crmComponents/CRMActions/CreateInteractionClientWrapper";
import { Customer } from '@/types/customer';

export default function CRMActions({ customers }: { customers: Customer[] }) {
    return (
        <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-auto">
                    <CreateCustomerClientWrapper />
                </div>
                <div className="w-full sm:w-auto">
                    <CreateInteractionClientWrapper customers={customers} />
                </div>
            </div>
        </div>
    );
}