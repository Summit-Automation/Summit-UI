import CreateCustomerClientWrapper from "@/components/crmComponents/CRMActions/CreateCustomerClientWrapper";
import CreateInteractionClientWrapper from "@/components/crmComponents/CRMActions/CreateInteractionClientWrapper";
import { Customer } from '@/types/customer';

export default function CRMActions({ customers }: { customers: Customer[] }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <CreateCustomerClientWrapper />
            <CreateInteractionClientWrapper customers={customers} />
        </div>
    );
}