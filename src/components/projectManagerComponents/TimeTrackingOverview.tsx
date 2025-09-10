'use client';

import { useState } from 'react';
import { Plus, Clock, Calendar, User, Kanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { TimeEntryWithUser } from '@/types/task';

interface TimeTrackingOverviewProps {
    timeEntries: TimeEntryWithUser[];
    compact?: boolean;
}

export default function TimeTrackingOverview({ timeEntries, compact = false }: TimeTrackingOverviewProps) {
    const [, setShowLogTimeModal] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    // Group time entries by date
    const groupedEntries = timeEntries.reduce((groups, entry) => {
        const date = entry.entry_date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(entry);
        return groups;
    }, {} as Record<string, TimeEntryWithUser[]>);

    const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
    );

    // Calculate total time for today and this week
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const todayEntries = timeEntries.filter(entry => entry.entry_date === today);
    const thisWeekEntries = timeEntries.filter(entry => new Date(entry.entry_date) >= oneWeekAgo);
    
    const todayTotal = todayEntries.reduce((sum, entry) => sum + entry.minutes, 0);
    const weekTotal = thisWeekEntries.reduce((sum, entry) => sum + entry.minutes, 0);

    if (timeEntries.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Time Logged Yet</h3>
                <p className="text-slate-500 mb-6">Start tracking time on your tasks to monitor progress.</p>
                <Button 
                    onClick={() => setShowLogTimeModal(true)}
                    variant="default"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Time
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!compact && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200">Time Tracking</h3>
                        <p className="text-sm text-slate-500">Monitor time spent on tasks</p>
                    </div>
                    <Button 
                        onClick={() => setShowLogTimeModal(true)}
                        size="sm"
                        variant="default"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Log Time
                    </Button>
                </div>
            )}

            {/* Time Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Today</p>
                            <p className="text-lg font-bold text-slate-200">
                                {formatTime(todayTotal)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">This Week</p>
                            <p className="text-lg font-bold text-slate-200">
                                {formatTime(weekTotal)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Entries */}
            <div className="space-y-4">
                {sortedDates.slice(0, compact ? 3 : 10).map((date) => {
                    const entries = groupedEntries[date];
                    const dayTotal = entries.reduce((sum, entry) => sum + entry.minutes, 0);
                    
                    return (
                        <div key={date} className="space-y-3">
                            <div className="flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-sm py-2 rounded-lg px-3 border border-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    <h4 className="font-semibold text-slate-300">
                                        {formatDate(date)}
                                    </h4>
                                </div>
                                <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30">
                                    {formatTime(dayTotal)}
                                </Badge>
                            </div>

                            <div className="space-y-2 pl-7">
                                {entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="group bg-slate-800/20 border border-slate-700/20 rounded-lg p-3 hover:bg-slate-800/40 hover:border-slate-600/30 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-xs">
                                                        {formatTime(entry.minutes)}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <User className="h-3 w-3" />
                                                        {entry.user_name}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                                                    {entry.description}
                                                </p>
                                                
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Kanban className="h-3 w-3" />
                                                    <span>Task #{entry.task_id.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {compact && sortedDates.length > 3 && (
                <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                        View All Time Entries
                    </Button>
                </div>
            )}
        </div>
    );
}