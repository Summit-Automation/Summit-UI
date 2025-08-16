export const dynamic = 'force-dynamic';

import { getCustomers } from "@/app/lib/services/crmServices/customer/getCustomers";
import { getInteractions } from "@/app/lib/services/crmServices/interaction/getInteractions";
import { getTransactions } from "@/app/lib/services/bookkeeperServices/getTransactions";

import { calculateMonthlyGrowth, getFollowUpsDue, getOverdueFollowUps } from "@/utils/dashboard/dashboardUtils";
import { DashboardContent } from "@/components/dashboardComponents/DashboardContent";

export default async function Dashboard() {
    // Fetch all data in parallel for optimal performance
    const [customers, interactions, transactions] = await Promise.all([
        getCustomers(),
        getInteractions(),
        getTransactions()
    ]);

    // Calculate metrics
    const totalCustomers = customers.length;
    const customerGrowth = calculateMonthlyGrowth(customers, 'created_at');
    const totalInteractions = interactions.length;
    const followUpsDue = getFollowUpsDue(interactions);
    const overdueFollowUps = getOverdueFollowUps();

    // Calculate revenue (simplified for demo)
    const revenue = transactions
        .filter(t => parseFloat(t.amount) > 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return (
        <DashboardContent
            customers={customers}
            interactions={interactions}
            transactions={transactions}
            totalCustomers={totalCustomers}
            revenue={revenue}
            customerGrowth={customerGrowth}
            totalInteractions={totalInteractions}
            followUpsDue={followUpsDue}
            overdueFollowUps={overdueFollowUps}
        />
    );
}