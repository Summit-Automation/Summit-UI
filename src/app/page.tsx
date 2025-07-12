import {getCustomers} from "@/app/lib/services/crmServices/getCustomers";
import {getInteractions} from "@/app/lib/services/crmServices/getInteractions";
import {getTransactions} from "@/app/lib/services/bookkeeperServices/getTransactions";

import CustomerStatusPie from "@/components/dashboardComponents/CustomerStatusPie";
import FollowUpPie from "@/components/dashboardComponents/FollowUpPie";
import ExpenseCategoryPie from "@/components/dashboardComponents/ExpenseCategoryPie";
import CustomerGrowthLine from "@/components/dashboardComponents/CustomerGrowthLine";
import CashFlowArea from "@/components/dashboardComponents/CashFlowArea";
import InteractionTypeBar from "@/components/dashboardComponents/InteractionTypeBar";


export default async function DashboardPage() {
    const [customers, interactions, transactions] = await Promise.all([getCustomers(), getInteractions(), getTransactions(),]);

    return (<div className="p-6 space-y-6">
            <h2 className="text-3xl font-bold mb-6">📊 Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Pie: Customer status */}
                <CustomerStatusPie customers={customers}/>

                {/* Pie: Follow-up status */}
                <FollowUpPie interactions={interactions}/>

                {/* Pie: Expense categories */}
                <ExpenseCategoryPie transactions={transactions}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Line: New customers over time */}
                <CustomerGrowthLine customers={customers}/>

                {/* Area: Income vs Expense */}
                <CashFlowArea transactions={transactions}/>
            </div>

            <div className="grid grid-cols-1">
                {/* Stacked bar: Interactions by type over time */}
                <InteractionTypeBar interactions={interactions}/>
            </div>

        </div>);
}