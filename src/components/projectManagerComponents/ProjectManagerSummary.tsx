'use client';

import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, CheckCircle, Clock, Calendar, AlertCircle } from "lucide-react";
import { GrowthIndicator } from "@/components/ui/growth-indicator";

import type { ProjectWithStats } from '@/types/project';
import type { TaskWithDetails } from '@/types/task';
import type { TimeEntryWithUser } from '@/types/task';

interface ProjectManagerSummaryProps {
    projects: ProjectWithStats[];
    tasks: TaskWithDetails[];
    timeEntries: TimeEntryWithUser[];
}

export default function ProjectManagerSummary({ projects, tasks, timeEntries }: ProjectManagerSummaryProps) {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => {
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date() && t.status !== 'done';
    }).length;
    
    // Calculate total hours logged this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekEntries = timeEntries.filter(entry => new Date(entry.entry_date) >= oneWeekAgo);
    const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + (entry.minutes / 60), 0);
    
    // Calculate total hours logged
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.minutes / 60), 0);
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const summaryCards = [
        {
            title: "Active Projects",
            value: activeProjects.toString(),
            change: `${completedProjects} completed`,
            changeType: "neutral" as const,
            icon: FolderOpen,
            color: "blue"
        },
        {
            title: "Task Completion",
            value: `${completionRate.toFixed(0)}%`,
            change: `${completedTasks}/${totalTasks} tasks`,
            changeType: completionRate >= 80 ? "positive" as const : completionRate >= 60 ? "neutral" as const : "negative" as const,
            icon: CheckCircle,
            color: "emerald"
        },
        {
            title: "Hours This Week",
            value: thisWeekHours.toFixed(1),
            change: `${totalHours.toFixed(1)} total hours`,
            changeType: "neutral" as const,
            icon: Clock,
            color: "purple"
        },
        {
            title: "Overdue Tasks",
            value: overdueTasks.toString(),
            change: `${inProgressTasks} in progress`,
            changeType: overdueTasks === 0 ? "positive" as const : overdueTasks <= 2 ? "neutral" as const : "negative" as const,
            icon: overdueTasks === 0 ? Calendar : AlertCircle,
            color: overdueTasks === 0 ? "emerald" : "amber"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {summaryCards.map((card, index) => {
                const Icon = card.icon;
                const colorClasses = {
                    blue: "text-blue-400 bg-blue-500/20",
                    emerald: "text-emerald-400 bg-emerald-500/20",
                    purple: "text-purple-400 bg-purple-500/20",
                    amber: "text-amber-400 bg-amber-500/20"
                };

                return (
                    <Card 
                        key={index} 
                        className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2.5 rounded-xl ${colorClasses[card.color as keyof typeof colorClasses]} transition-all duration-300 group-hover:scale-110`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">
                                            {card.title}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-bold text-slate-50 tracking-tight">
                                            {card.value}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <GrowthIndicator 
                                                value={card.changeType === 'positive' ? 5 : card.changeType === 'negative' ? -5 : 0}
                                            />
                                            <p className="text-sm text-slate-500 font-medium">
                                                {card.change}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}