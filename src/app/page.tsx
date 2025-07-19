import {getCustomers} from "@/app/lib/services/crmServices/customer/getCustomers";
import {getInteractions} from "@/app/lib/services/crmServices/interaction/getInteractions";
import {getTransactions} from "@/app/lib/services/bookkeeperServices/getTransactions";

import {calculateMonthlyGrowth, getFollowUpsDue, getOverdueFollowUps,} from "@/utils/dashboard/dashboardUtils";

import DashboardControls from "@/components/dashboardComponents/DashboardControls";
import CustomerStatusPie from "@/components/dashboardComponents/CustomerStatusPie";
import FollowUpPie from "@/components/dashboardComponents/FollowUpPie";
import ExpenseCategoryPie from "@/components/dashboardComponents/ExpenseCategoryPie";
import CustomerGrowthLine from "@/components/dashboardComponents/CustomerGrowthLine";
import CashFlowArea from "@/components/dashboardComponents/CashFlowArea";
import InteractionTypeBar from "@/components/dashboardComponents/InteractionTypeBar";
import FeedbackButton from "@/components/globalComponents/FeedbackButton";

import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    Calendar, 
    DollarSign, 
    MessageSquare, 
    TrendingDown, 
    TrendingUp, 
    Users,
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
    const overdueFollowUps = getOverdueFollowUps(interactions);

    // Calculate revenue metrics
    const totalRevenue = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const totalExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const netProfit = totalRevenue - totalExpenses;

    function GrowthIndicator({value}: {value: number}) {
        const isPositive = value >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';

        return (
            <div className="flex items-center gap-2 text-sm">
                <Icon className={`h-4 w-4 ${colorClass}`}/>
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
            <Card className="card-clean transition-smooth hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                        {title}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-50">{value}</div>
                    {growth !== undefined && (
                        <div className="mt-1">
                            <GrowthIndicator value={growth} />
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Clean Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50">
                        Business Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Real-time insights and analytics for your business
                    </p>
                </div>

                <DashboardControls
                    customers={customers}
                    interactions={interactions}
                    transactions={transactions}
                />
            </div>

            {/* Clean Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Follow-ups Alert */}
            {followUpsDue > 0 && (
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-400">
                            <Calendar className="h-5 w-5" />
                            Follow-ups Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                {followUpsDue} pending
                            </Badge>
                            {overdueFollowUps > 0 && (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                                    {overdueFollowUps} overdue
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Clean Analytics */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-fit">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="chart-clean">
                            <CardHeader>
                                <CardTitle className="chart-title">Customer Growth</CardTitle>
                                <CardDescription className="chart-subtitle">
                                    New customer acquisition over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CustomerGrowthLine customers={customers}/>
                            </CardContent>
                        </Card>

                        <Card className="chart-clean">
                            <CardHeader>
                                <CardTitle className="chart-title">Cash Flow</CardTitle>
                                <CardDescription className="chart-subtitle">
                                    Income vs expenses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CashFlowArea transactions={transactions}/>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="chart-clean">
                        <CardHeader>
                            <CardTitle className="chart-title">Interaction Activity</CardTitle>
                            <CardDescription className="chart-subtitle">
                                Customer touchpoints by type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InteractionTypeBar interactions={interactions}/>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="chart-clean">
                            <CardHeader>
                                <CardTitle className="chart-title">Customer Status</CardTitle>
                                <CardDescription className="chart-subtitle">
                                    Pipeline distribution
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CustomerStatusPie customers={customers} size="lg"/>
                            </CardContent>
                        </Card>

                        <Card className="chart-clean">
                            <CardHeader>
                                <CardTitle className="chart-title">Follow-ups</CardTitle>
                                <CardDescription className="chart-subtitle">
                                    Pending follow-up requirements
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FollowUpPie interactions={interactions}/>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="chart-clean">
                            <CardHeader>
                                <CardTitle className="chart-title">Expense Categories</CardTitle>
                                <CardDescription className="chart-subtitle">
                                    Spending breakdown
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ExpenseCategoryPie transactions={transactions}/>
                            </CardContent>
                        </Card>

                        <Card className="chart-clean">
                            <CardHeader>
                                <CardTitle className="chart-title">Financial Overview</CardTitle>
                                <CardDescription className="chart-subtitle">
                                    Comprehensive cash flow
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CashFlowArea transactions={transactions}/>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <FeedbackButton />
        </div>
    );
}