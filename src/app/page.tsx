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
    BarChart3, Calendar, DollarSign, LineChart, MessageSquare, PieChart, TrendingDown, TrendingUp, Users,
} from "lucide-react";

export default async function DashboardPage() {
    const [customers, interactions, transactions] = await Promise.all([getCustomers(), getInteractions(), getTransactions(),]);

    // Calculate some key metrics
    const totalCustomers = customers?.length || 0;
    const totalInteractions = interactions?.length || 0;
    const totalTransactions = transactions?.length || 0;

    const customerGrowth = calculateMonthlyGrowth(customers, "created_at");
    const interactionGrowth = calculateMonthlyGrowth(interactions, "created_at");
    const transactionGrowth = calculateMonthlyGrowth(transactions, "timestamp");

    const followUpsDue = getFollowUpsDue(interactions);
    const overdueFollowUps = getOverdueFollowUps(interactions);

    function GrowthIndicator({value}: { value: number }) {
        const isPositive = value >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';

        return (<div className="flex items-center space-x-2 text-xs">
            <Icon className={`h-3 w-3 ${colorClass}`}/>
            <span className={colorClass}>
        {Math.abs(value)}% {isPositive ? 'up' : 'down'} from last month
      </span>
        </div>);
    }

    function FollowUpIndicator({due, overdue}: { due: number; overdue: number }) {
        const hasOverdue = overdue > 0;
        return (<div className="flex items-center space-x-2 text-xs">
            {hasOverdue ? (<Badge className="bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30">
                Urgent
            </Badge>) : (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/30">
                    All Clear
                </Badge>)}
            <span className={hasOverdue ? "text-red-400" : "text-emerald-400"}>
        {overdue} overdue
      </span>
        </div>);
    }

    return (<div className="min-h-screen bg-slate-950 text-foreground">
        <div className="container mx-auto p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">📊 Dashboard Overview</h1>
                    <p className="text-slate-400">Real-time insights and analytics for your business</p>
                </div>


                <DashboardControls
                    customers={customers}
                    interactions={interactions}
                    transactions={transactions}
                />
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                    className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">Total Customers</CardTitle>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <Users className="h-4 w-4 text-icon"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">{totalCustomers}</div>
                        <GrowthIndicator value={customerGrowth}/>
                    </CardContent>
                </Card>

                <Card
                    className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">Interactions</CardTitle>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <MessageSquare className="h-4 w-4 text-icon"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">{totalInteractions}</div>
                        <GrowthIndicator value={interactionGrowth}/>
                    </CardContent>
                </Card>

                <Card
                    className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">Transactions</CardTitle>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <DollarSign className="h-4 w-4 text-icon"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">{totalTransactions}</div>
                        <GrowthIndicator value={transactionGrowth}/>
                    </CardContent>
                </Card>

                <Card
                    className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">Follow-ups Due</CardTitle>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <Calendar className="h-4 w-4 text-icon"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">{followUpsDue}</div>
                        <FollowUpIndicator
                            due={followUpsDue}
                            overdue={overdueFollowUps}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts Section */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-fit bg-slate-900/50 border-slate-800 p-1">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-slate-800 data-[state=active]:text-sky-400 data-[state=active]:shadow-sm text-slate-400 hover:text-slate-300 transition-all duration-200"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="customers"
                        className="data-[state=active]:bg-slate-800 data-[state=active]:text-sky-400 data-[state=active]:shadow-sm text-slate-400 hover:text-slate-300 transition-all duration-200"
                    >
                        Customers
                    </TabsTrigger>
                    <TabsTrigger
                        value="financial"
                        className="data-[state=active]:bg-slate-800 data-[state=active]:text-sky-400 data-[state=active]:shadow-sm text-slate-400 hover:text-slate-300 transition-all duration-200"
                    >
                        Financial
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Growth Chart */}
                        <Card
                            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <div className="p-2 bg-slate-800/50 rounded-lg">
                                        <LineChart className="h-5 w-5 text-icon"/>
                                    </div>
                                    Customer Growth
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Track new customer acquisition over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CustomerGrowthLine customers={customers}/>
                            </CardContent>
                        </Card>

                        {/* Cash Flow Chart */}
                        <Card
                            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <div className="p-2 bg-slate-800/50 rounded-lg">
                                        <BarChart3 className="h-5 w-5 text-icon"/>
                                    </div>
                                    Cash Flow
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Income vs expenses over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CashFlowArea transactions={transactions}/>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Interactions Chart */}
                    <Card
                        className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-white">
                                <div className="p-2 bg-slate-800/50 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-icon"/>
                                </div>
                                Interaction Types
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Breakdown of customer interactions by type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InteractionTypeBar interactions={interactions}/>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Status Pie */}
                        <Card
                            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <div className="p-2 bg-slate-800/50 rounded-lg">
                                        <PieChart className="h-5 w-5 text-icon"/>
                                    </div>
                                    Customer Status
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Current status distribution of customers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CustomerStatusPie customers={customers} size="lg"/>
                            </CardContent>
                        </Card>

                        {/* Follow-up Status Pie */}
                        <Card
                            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <div className="p-2 bg-slate-800/50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-icon"/>
                                    </div>
                                    Follow-up Status
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Pending follow-ups and their priorities
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
                        {/* Expense Categories Pie */}
                        <Card
                            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <div className="p-2 bg-slate-800/50 rounded-lg">
                                        <PieChart className="h-5 w-5 text-icon"/>
                                    </div>
                                    Expense Categories
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Breakdown of expenses by category
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ExpenseCategoryPie transactions={transactions}/>
                            </CardContent>
                        </Card>

                        {/* Cash Flow Analysis */}
                        <Card
                            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <div className="p-2 bg-slate-800/50 rounded-lg">
                                        <BarChart3 className="h-5 w-5 text-icon"/>
                                    </div>
                                    Cash Flow Analysis
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Detailed income vs expenses analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CashFlowArea transactions={transactions}/>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
        
        {/* Feedback Button - Fixed positioned, non-intrusive */}
        <FeedbackButton />
    </div>);
}