import { getMileageEntries } from '@/app/lib/services/mileageServices/getMileageEntries';
import MileageSummary from '@/components/mileageComponents/MileageSummary';
import MileageActions from '@/components/mileageComponents/MileageActions';
import MileageTable from '@/components/mileageComponents/MileageTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import MileageChart from "@/components/mileageComponents/MileageChart";

export default async function MileagePage() {
    const mileageEntries = await getMileageEntries();

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-3xl font-bold">🚗 Mileage Tracker</h2>

            {/* Summary - Full Width */}
            <div className="w-full">
                <MileageSummary mileageEntries={mileageEntries} />
            </div>

            {/* Chart - Full Width */}
            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <Activity className="h-5 w-5 text-icon" />
                        </div>
                        Monthly Mileage Trends
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Business miles tracked over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MileageChart mileageEntries={mileageEntries} />
                </CardContent>
            </Card>

            {/* Actions */}
            <MileageActions />

            {/* Mileage Table */}
            <Card className="overflow-x-auto bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>All Mileage Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <MileageTable mileageEntries={mileageEntries} />
                </CardContent>
            </Card>
        </div>
    );
}