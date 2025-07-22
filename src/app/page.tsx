export const dynamic = 'force-dynamic';

import { getCustomers } from "@/app/lib/services/crmServices/customer/getCustomers";
import { getInteractions } from "@/app/lib/services/crmServices/interaction/getInteractions";
import { getTransactions } from "@/app/lib/services/bookkeeperServices/getTransactions";

import { calculateMonthlyGrowth, getFollowUpsDue, getOverdueFollowUps } from "@/utils/dashboard/dashboardUtils";

import DashboardControls from "@/components/dashboardComponents/DashboardControls";
import CustomerStatusPie from "@/components/dashboardComponents/CustomerStatusPie";
import FollowUpPie from "@/components/dashboardComponents/FollowUpPie";
import ExpenseCategoryPie from "@/components/dashboardComponents/ExpenseCategoryPie";
import CustomerGrowthLine from "@/components/dashboardComponents/CustomerGrowthLine";
import CashFlowArea from "@/components/dashboardComponents/CashFlowArea";
import InteractionTypeBar from "@/components/dashboardComponents/InteractionTypeBar";
import FeedbackButton from "@/components/globalComponents/FeedbackButton";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar, 
    DollarSign, 
    MessageSquare, 
    TrendingDown, 
    TrendingUp, 
    Users,
    PieChart,
    Activity,
} from "lucide-react";

export default async function DashboardPage() {
    const [customers, interactions, transactions] = await Promise.all([
        getCustomers(), 
        getInteractions(), 
        getTransactions(),
    ]);

    // Calculate key metrics
    const totalCustomers = customers?.length || 0;
    const totalInteractions = interactions?.length || 0;

    const customerGrowth = calculateMonthlyGrowth(customers, "created_at");
    const interactionGrowth = calculateMonthlyGrowth(interactions, "created_at");
    const transactionGrowth = calculateMonthlyGrowth(transactions, "timestamp");

    const followUpsDue = getFollowUpsDue(interactions);
    const overdueFollowUps = getOverdueFollowUps();

    // Calculate revenue metrics
    const totalRevenue = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const totalExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const netProfit = totalRevenue - totalExpenses;

    function GrowthIndicator({ value }: { value: number }) {
        const isPositive = value >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';

        return (
            <div className="flex items-center gap-1 text-xs">
                <Icon className={`h-3 w-3 ${colorClass} icon-interactive`} />
                <span className={colorClass}>
                    {isPositive ? '+' : ''}{Math.abs(value)}%
                </span>
            </div>
        );
    }

    function MetricCard({ 
        title, 
        value, 
        growth, 
        icon: Icon,
    }: {
        title: string;
        value: string | number;
        growth?: number;
        icon: React.ComponentType<{ className?: string }>;
    }) {
        return (
            <Card className="metric-enhanced card-enhanced data-appear">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-slate-400 truncate pr-2 uppercase tracking-wide">
                        {title}
                    </CardTitle>
                    <div className="p-1.5 bg-slate-800/50 rounded-lg flex-shrink-0 transition-all duration-300 group-hover:scale-110">
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 icon-interactive" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-end gap-2">
                        <div className="text-lg sm:text-xl font-bold text-slate-50 truncate text-gradient" title={value.toString()}>
                            {value}
                        </div>
                        {growth !== undefined && (
                            <div className="mb-0.5">
                                <GrowthIndicator value={growth} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Mobile-optimized Header */}
            <div className="space-y-3 sm:space-y-4 data-appear">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient">
                        Business Dashboard
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Real-time insights and analytics for your business
                    </p>
                </div>

                {/* Mobile-friendly controls */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <DashboardControls
                        customers={customers}
                        interactions={interactions}
                        transactions={transactions}
                    />
                </div>
            </div>

            {/* Mobile-responsive Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                    title="Total Customers"
                    value={totalCustomers.toLocaleString()}
                    growth={customerGrowth}
                    icon={Users}
                />

                <MetricCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    growth={transactionGrowth}
                    icon={DollarSign}
                />

                <MetricCard
                    title="Net Profit"
                    value={`$${netProfit.toLocaleString()}`}
                    icon={TrendingUp}
                />

                <MetricCard
                    title="Interactions"
                    value={totalInteractions.toLocaleString()}
                    growth={interactionGrowth}
                    icon={MessageSquare}
                />
            </div>

            {/* Follow-ups Alert - Mobile optimized */}
            {followUpsDue > 0 && (
                <Card className="border-amber-500/20 bg-amber-500/5 card-enhanced data-appear">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-amber-400 text-base">
                            <Calendar className="h-4 w-4 icon-interactive" />
                            Follow-ups Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="status-badge-enhanced status-warning text-xs">
                                {followUpsDue} pending
                            </Badge>
                            {overdueFollowUps > 0 && (
                                <Badge className="status-badge-enhanced status-error text-xs">
                                    {overdueFollowUps} overdue
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Mobile-responsive Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-4 data-appear">
                <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10 sm:w-fit bg-slate-900/50 border border-slate-800">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="text-xs sm:text-sm px-2 sm:px-4">
                        Customers
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="text-xs sm:text-sm px-2 sm:px-4">
                        Financial
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                    {/* Mobile: Stack charts vertically, Desktop: 2 columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                                    <div className="p-1.5 bg-slate-800/50 rounded-lg">
                                        <TrendingUp className="h-4 w-4 text-blue-400 icon-interactive" />
                                    </div>
                                    Customer Growth
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                                    New customer acquisition over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 custom-scrollbar">
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <CustomerGrowthLine customers={customers} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                                    <div className="p-1.5 bg-slate-800/50 rounded-lg">
                                        <Activity className="h-4 w-4 text-green-400 icon-interactive" />
                                    </div>
                                    Cash Flow
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                                    Income vs expenses
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 custom-scrollbar">
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <CashFlowArea transactions={transactions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Full width chart on mobile and desktop */}
                    <Card className="chart-container-enhanced card-enhanced">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                                <div className="p-1.5 bg-slate-800/50 rounded-lg">
                                    <MessageSquare className="h-4 w-4 text-purple-400 icon-interactive" />
                                </div>
                                Interaction Activity
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs sm:text-sm">
                                Customer touchpoints by type
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 custom-scrollbar">
                            <div className="h-48 sm:h-64 lg:h-80">
                                <InteractionTypeBar interactions={interactions} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                                    <div className="p-1.5 bg-slate-800/50 rounded-lg">
                                        <PieChart className="h-4 w-4 text-blue-400 icon-interactive" />
                                    </div>
                                    Customer Status
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                                    Pipeline distribution
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 custom-scrollbar">
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <CustomerStatusPie customers={customers} size="lg" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                                    <div className="p-1.5 bg-slate-800/50 rounded-lg">
                                        <Calendar className="h-4 w-4 text-amber-400 icon-interactive" />
                                    </div>
                                    Follow-ups
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                                    Pending follow-up requirements
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 custom-scrollbar">
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <FollowUpPie interactions={interactions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                                    <div className="p-1.5 bg-slate-800/50 rounded-lg">
                                        <PieChart className="h-4 w-4 text-red-400 icon-interactive" />
                                    </div>
                                    Expense Categories
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                                    Spending breakdown
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 custom-scrollbar">
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <ExpenseCategoryPie transactions={transactions} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg text-gradient">
                                    <div className="p-1.5 bg-slate-800/50 rounded-lg">
                                        <Activity className="h-4 w-4 text-green-400 icon-interactive" />
                                    </div>
                                    Financial Overview
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                                    Comprehensive cash flow
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6 custom-scrollbar">
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <CashFlowArea transactions={transactions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <FeedbackButton />
        </div>
    );
}