export const dynamic = 'force-dynamic';

import { getMileageEntries } from '@/app/lib/services/mileageServices/getMileageEntries';
import MileageSummary from '@/components/mileageComponents/MileageSummary';
import MileageActions from '@/components/mileageComponents/MileageActions';
import MileageTable from '@/components/mileageComponents/MileageTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Car } from 'lucide-react';
import MileageChart from "@/components/mileageComponents/MileageChart";

export default async function MileagePage() {
    const mileageEntries = await getMileageEntries();

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="data-appear">
                <h2 className="text-3xl font-bold text-gradient">Mileage Tracker</h2>
                <p className="text-slate-400 mt-2">Track business miles for accurate tax deductions</p>
            </div>

            {/* Summary - Always Visible */}
            <div className="w-full">
                <MileageSummary mileageEntries={mileageEntries} />
            </div>

            {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
            <div className="hidden lg:block space-y-6">
                {/* Chart - Desktop Only */}
                <Card className="chart-container-enhanced card-enhanced">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gradient">
                            <div className="p-2 bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-110">
                                <Activity className="h-5 w-5 text-blue-400 icon-interactive" />
                            </div>
                            Monthly Mileage Trends
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Business vs personal miles tracked over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="custom-scrollbar">
                        <MileageChart mileageEntries={mileageEntries} />
                    </CardContent>
                </Card>

                {/* Actions - Desktop */}
                <MileageActions />

                {/* Table - Desktop */}
                <Card className="card-enhanced">
                    <CardHeader>
                        <CardTitle className="text-gradient">All Mileage Entries</CardTitle>
                        <CardDescription className="text-slate-400">
                            Complete record of all tracked mileage with tax implications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MileageTable mileageEntries={mileageEntries} />
                    </CardContent>
                </Card>
            </div>

            {/* Mobile: Tabbed Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="entries" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="entries" className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span className="hidden sm:inline">Data</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="entries" className="mt-4 space-y-4">
                        <MileageActions />
                        
                        <Card className="card-enhanced">
                            <CardHeader>
                                <CardTitle className="text-gradient">All Mileage Entries</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Complete record of all tracked mileage with tax implications
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MileageTable mileageEntries={mileageEntries} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-4">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-gradient">
                                    <Activity className="h-5 w-5 text-blue-400 icon-interactive" />
                                    Monthly Mileage Trends
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Business vs personal miles tracked over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="custom-scrollbar">
                                <MileageChart mileageEntries={mileageEntries} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}