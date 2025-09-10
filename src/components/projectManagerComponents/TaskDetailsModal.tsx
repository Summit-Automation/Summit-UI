'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Clock, Calendar, MessageSquare, Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from 'date-fns';
import Avatar from 'react-avatar';
import { getTimeEntries } from '@/app/lib/services/projectManagerServices/timeEntryServices';
import { toast } from 'sonner';
import { isOverdue } from '@/utils/dateUtils';
import type { TaskWithDetails, TimeEntryWithUser } from '@/types/task';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: TaskWithDetails;
    onEditTask?: (task: TaskWithDetails) => void;
    onDeleteTask?: (task: TaskWithDetails) => void;
    onLogTime?: (task: TaskWithDetails) => void;
}

export default function TaskDetailsModal({ 
    isOpen, 
    onClose, 
    task, 
    onEditTask, 
    onDeleteTask, 
    onLogTime 
}: TaskDetailsModalProps) {
    const [timeEntries, setTimeEntries] = useState<TimeEntryWithUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    
    useEffect(() => {
        setCurrentDate(new Date());
    }, []);

    useEffect(() => {
        if (isOpen && task.id) {
            fetchTimeEntries();
        }
    }, [isOpen, task.id, fetchTimeEntries]);

    const fetchTimeEntries = useCallback(async () => {
        setLoading(true);
        try {
            const entries = await getTimeEntries(task.id);
            setTimeEntries(entries);
        } catch (error) {
            console.error('Error fetching time entries:', error);
            toast.error('Failed to load time entries');
        } finally {
            setLoading(false);
        }
    }, [task.id]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'backlog': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
            case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
            case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const getTotalTime = () => {
        return timeEntries.reduce((total, entry) => total + entry.minutes, 0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <Badge className={`${getPriorityColor(task.priority)} text-xs font-medium px-2 py-1`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                            <Badge className={`${getStatusColor(task.status)} text-xs font-medium px-2 py-1`}>
                                {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                            </Badge>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                            {task.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditTask?.(task)}
                            className="gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteTask?.(task)}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex h-full max-h-[calc(90vh-120px)]">
                    {/* Left Panel - Task Details */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Description */}
                        {task.description && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Description
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {task.description}
                                </div>
                            </div>
                        )}

                        {/* Task Details Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Project</h4>
                                    <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                                        {task.project_name || 'No Project'}
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Assignee</h4>
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            name={task.assigned_to_email || 'Unassigned'}
                                            size="24"
                                            round={true}
                                            className="text-xs"
                                        />
                                        <span className="text-sm text-slate-900 dark:text-slate-100">
                                            {task.assigned_to_name || 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {task.due_date && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Due Date</h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm text-slate-900 dark:text-slate-100">
                                                {format(new Date(task.due_date), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Time Logged</h4>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {formatTime(getTotalTime())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {task.due_date && isOverdue(task.due_date, task.status, currentDate) && (
                            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                                    This task is overdue
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Time Entries */}
                    <div className="w-96 border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Time Tracking
                                </h3>
                                <Button
                                    size="sm"
                                    onClick={() => onLogTime?.(task)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Log Time
                                </Button>
                            </div>
                            
                            {getTotalTime() > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Time</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {formatTime(getTotalTime())}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Time Entries List */}
                        <div className="p-6 overflow-y-auto max-h-[400px]">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3 animate-pulse">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : timeEntries.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                        No time entries yet
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => onLogTime?.(task)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Log Your First Entry
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {timeEntries.map((entry) => (
                                        <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        name={entry.user_name || entry.user_email}
                                                        size="20"
                                                        round={true}
                                                        className="text-xs"
                                                    />
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {entry.user_name || entry.user_email || 'Unknown User'}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatTime(entry.minutes)}
                                                </div>
                                            </div>
                                            
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
                                                {' • '}
                                                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                            </div>
                                            
                                            {entry.description && (
                                                <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded p-2 mt-2">
                                                    {entry.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}