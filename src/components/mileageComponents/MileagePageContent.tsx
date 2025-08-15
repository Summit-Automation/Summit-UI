'use client';

import { useRouter } from 'next/navigation';
import {Header} from '@/components/globalComponents/Header';
import MileageSummary from '@/components/mileageComponents/MileageSummary';
import MileageActions from '@/components/mileageComponents/MileageActions';
import MileageTable from '@/components/mileageComponents/MileageTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Car } from 'lucide-react';
import MileageChart from "@/components/mileageComponents/MileageChart";

import type { MileageEntry } from '@/types/mileage';

interface MileagePageContentProps {
    mileageEntries: MileageEntry[];
}

export default function MileagePageContent({ mileageEntries }: MileagePageContentProps) {
    const router = useRouter();

    const handleSettings = () => router.push('/settings');
    const handleHelp = () => router.push('/?tab=help');

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <Header 
                title="Mileage Tracker"
                subtitle="Track business miles for accurate tax deductions"
                onSettings={handleSettings}
                onHelp={handleHelp}
            />

            <div className="px-4 lg:px-6 space-y-6">

            {/* Summary - Always Visible */}
            <div className="w-full">
                <MileageSummary mileageEntries={mileageEntries} />
            </div>

            {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
            <div className="hidden lg:block space-y-6">
                {/* Chart - Desktop Only */}
                <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm p-6">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                            <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                <Activity className="h-5 w-5 text-blue-400" />
                            </div>
                            Monthly Mileage Trends
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-2">
                            Business vs personal miles tracked over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                            <MileageChart mileageEntries={mileageEntries} />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions - Desktop */}
                <MileageActions />

                {/* Table - Desktop */}
                <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                            <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                <Car className="h-5 w-5 text-purple-400"/>
                            </div>
                            All Mileage Entries
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-2">
                            Complete record of all tracked mileage with tax implications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <MileageTable mileageEntries={mileageEntries} />
                    </CardContent>
                </Card>
            </div>

            {/* Mobile: Tabbed Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="entries" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-11 bg-slate-900/60 rounded-2xl border border-slate-800/40 p-1">
                        <TabsTrigger 
                            value="entries" 
                            className="flex items-center gap-2 text-sm px-4 lg:px-6 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium"
                        >
                            <Car className="h-4 w-4" />
                            <span className="hidden sm:inline">Data</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="analytics" 
                            className="flex items-center gap-2 text-sm px-4 lg:px-6 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="entries" className="mt-4 space-y-4">
                        <MileageActions />
                        
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                        <Car className="h-5 w-5 text-purple-400"/>
                                    </div>
                                    All Mileage Entries
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Complete record of all tracked mileage with tax implications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <MileageTable mileageEntries={mileageEntries} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-4">
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                        <Activity className="h-5 w-5 text-blue-400" />
                                    </div>
                                    Monthly Mileage Trends
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Business vs personal miles tracked over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 rounded-xl overflow-hidden">
                                    <MileageChart mileageEntries={mileageEntries} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            </div>
        </div>
    );
}