'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Header } from "@/components/globalComponents/Header";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Users, DollarSign, TrendingUp, MessageSquare, Calendar, Activity, PieChart, Bell, HelpCircle } from "lucide-react";

import type { Customer } from '@/types/customer';
import type { Interaction } from '@/types/interaction';
import type { Transaction } from '@/types/transaction';

interface DashboardContentProps {
    customers: Customer[];
    interactions: Interaction[];
    transactions: Transaction[];
    totalCustomers: number;
    revenue: number;
    customerGrowth: number;
    totalInteractions: number;
    followUpsDue: number;
    overdueFollowUps: number;
}

export function DashboardContent({
    customers,
    interactions,
    transactions,
    totalCustomers,
    revenue,
    customerGrowth,
    totalInteractions,
    followUpsDue,
    overdueFollowUps
}: DashboardContentProps) {
    const router = useRouter();
    const { formatAmount } = useCurrency();
    const [notifications] = useState([
        { id: 1, message: "3 new customers added today", timestamp: new Date() },
        { id: 2, message: "Monthly report ready for review", timestamp: new Date() },
        { id: 3, message: "5 follow-ups due this week", timestamp: new Date() }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleSettings = () => router.push('/settings');
    
    // Notification handlers
    const handleNotifications = () => setShowNotifications(true);
    const handleHelp = () => setShowHelp(true);
    
    function GrowthIndicator({ value }: { value: number }) {
        const isPositive = value > 0;
        const isNeutral = value === 0;
        
        return (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                isNeutral 
                    ? 'text-slate-400 bg-slate-400/10' 
                    : isPositive 
                        ? 'text-emerald-400 bg-emerald-400/10' 
                        : 'text-red-400 bg-red-400/10'
            }`}>
                <span className={isNeutral ? '' : isPositive ? '↗' : '↘'}>
                    {isNeutral ? '→' : ''}
                </span>
                <span>{Math.abs(value).toFixed(1)}%</span>
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
            <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm p-6 group cursor-default card-bg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xs text-slate-500 font-semibold uppercase tracking-wider card-title-small">
                        {title}
                    </CardTitle>
                    <div className="p-2.5 bg-slate-800/40 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-700/50 card-icon-bg">
                        <Icon className="h-4 w-4 text-blue-400" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-end gap-3">
                        <div className="text-2xl lg:text-3xl font-bold text-slate-50 group-hover:text-white transition-colors card-value" title={value.toString()}>
                            {value}
                        </div>
                        {growth !== undefined && (
                            <div className="mb-1">
                                <GrowthIndicator value={growth} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Modern Header */}
            <Header 
                title="Business Dashboard"
                subtitle="Monitor your automation and business performance"
                onNotifications={handleNotifications}
                onSettings={handleSettings}
                onHelp={handleHelp}
                actions={
                    <div className="hidden lg:flex">
                        <DashboardControls
                            customers={customers}
                            interactions={interactions}
                            transactions={transactions}
                        />
                    </div>
                }
            />


            {/* Main Content */}
            <div className="px-4 lg:px-6 space-y-6">

            {/* Responsive Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <MetricCard
                    title="Total Customers"
                    value={totalCustomers.toLocaleString()}
                    growth={customerGrowth}
                    icon={Users}
                />
                <MetricCard
                    title="Monthly Revenue"
                    value={formatAmount(revenue)}
                    growth={8.2}
                    icon={DollarSign}
                />
                <MetricCard
                    title="Growth Rate"
                    value={`${customerGrowth > 0 ? '+' : ''}${customerGrowth.toFixed(1)}%`}
                    growth={customerGrowth}
                    icon={TrendingUp}
                />
                <MetricCard
                    title="Interactions"
                    value={totalInteractions.toLocaleString()}
                    growth={12.5}
                    icon={MessageSquare}
                />
            </div>

            {/* Follow-ups Alert */}
            {followUpsDue > 0 && (
                <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm p-6">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-amber-300 font-semibold">
                            <div className="p-2.5 bg-amber-500/20 rounded-xl">
                                <Calendar className="h-5 w-5" />
                            </div>
                            Follow-ups Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="px-3 py-1.5 bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-full text-sm font-semibold">
                                {followUpsDue} pending
                            </Badge>
                            {overdueFollowUps > 0 && (
                                <Badge className="px-3 py-1.5 bg-red-500/20 text-red-200 border border-red-500/30 rounded-full text-sm font-semibold">
                                    {overdueFollowUps} overdue
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Analytics Dashboard */}
            <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-50">Analytics Overview</h2>
                        <p className="text-sm text-slate-400">Detailed insights into your business performance</p>
                    </div>
                    <TabsList className="grid w-full sm:w-fit grid-cols-3 h-11 bg-slate-900/60 rounded-2xl border border-slate-800/40 p-1">
                        <TabsTrigger 
                            value="overview" 
                            className="text-sm px-4 lg:px-6 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger 
                            value="customers" 
                            className="text-sm px-4 lg:px-6 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium"
                        >
                            Customers
                        </TabsTrigger>
                        <TabsTrigger 
                            value="financial" 
                            className="text-sm px-4 lg:px-6 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium"
                        >
                            Financial
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                    {/* Responsive Charts Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                        <TrendingUp className="h-5 w-5 text-blue-400" />
                                    </div>
                                    Customer Growth
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    New customer acquisition over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                    <CustomerGrowthLine customers={customers} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                        <Activity className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    Cash Flow
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Income vs expenses
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                    <CashFlowArea transactions={transactions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Full width chart */}
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                    <MessageSquare className="h-5 w-5 text-purple-400" />
                                </div>
                                Interaction Activity
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2">
                                Customer touchpoints and engagement metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                <InteractionTypeBar interactions={interactions} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                        <PieChart className="h-5 w-5 text-blue-400" />
                                    </div>
                                    Customer Status
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Pipeline distribution and conversion rates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                    <CustomerStatusPie customers={customers} size="lg" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-amber-500/20 rounded-xl">
                                        <Calendar className="h-5 w-5 text-amber-400" />
                                    </div>
                                    Follow-ups
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Pending and overdue follow-up tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                    <FollowUpPie interactions={interactions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-red-500/20 rounded-xl">
                                        <PieChart className="h-5 w-5 text-red-400" />
                                    </div>
                                    Expense Categories
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Spending breakdown and budget analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                    <ExpenseCategoryPie transactions={transactions} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                        <Activity className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    Financial Overview
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Revenue trends and cash flow analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                    <CashFlowArea transactions={transactions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <FeedbackButton />
            </div>

            {/* Functional Modals and Dialogs */}
            
            {/* Notifications Modal */}
            <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
                <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-50">
                            <Bell className="h-5 w-5 text-blue-400" />
                            Notifications
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Recent activity and updates
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="p-3 bg-slate-800/50 rounded-lg">
                                <p className="text-sm text-slate-200">{notification.message}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {notification.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>


            {/* Help Modal */}
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
                <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-50">
                            <HelpCircle className="h-5 w-5 text-blue-400" />
                            Help & Support
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Get help with Summit Automation features
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <h3 className="font-semibold text-slate-200 mb-2">Quick Help</h3>
                            <div className="space-y-2 text-sm text-slate-400">
                                <p>• <strong>Dashboard:</strong> View business metrics and quick actions</p>
                                <p>• <strong>CRM:</strong> Manage customers and track interactions</p>
                                <p>• <strong>Accounting:</strong> Track finances and transactions</p>
                                <p>• <strong>Mileage:</strong> Log business trips for tax deductions</p>
                                <p>• <strong>Inventory:</strong> Monitor stock levels and alerts</p>
                                <p>• <strong>Lead Gen:</strong> Generate and manage business leads</p>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => router.push('/settings')}
                                className="border-slate-600 text-slate-200 hover:bg-slate-800"
                            >
                                Settings & Preferences
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => alert('Internal support system - Contact your administrator')}
                                className="border-slate-600 text-slate-200 hover:bg-slate-800"
                            >
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}