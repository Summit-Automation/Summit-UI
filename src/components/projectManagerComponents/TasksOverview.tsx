'use client';
import { Plus, Kanban, Calendar, User, Clock, MoreHorizontal, AlertTriangle, Flag, CheckCircle2, CircleDot, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { TaskWithDetails } from '@/types/task';

interface TasksOverviewProps {
    tasks: TaskWithDetails[];
    compact?: boolean;
    onCreateTask?: () => void;
}

export default function TasksOverview({ tasks, compact = false, onCreateTask }: TasksOverviewProps) {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'backlog': return <CircleDot className="h-3 w-3" />;
            case 'in_progress': return <Timer className="h-3 w-3" />;
            case 'review': return <AlertTriangle className="h-3 w-3" />;
            case 'done': return <CheckCircle2 className="h-3 w-3" />;
            case 'blocked': return <AlertTriangle className="h-3 w-3" />;
            default: return <CircleDot className="h-3 w-3" />;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'backlog': return 'pm-status-backlog';
            case 'in_progress': return 'pm-status-progress';
            case 'review': return 'pm-status-review';
            case 'done': return 'pm-status-done';
            case 'blocked': return 'pm-status-blocked';
            default: return 'pm-status-backlog';
        }
    };

    const getPriorityIcon = (priority: string) => {
        const iconProps = { className: "h-4 w-4" };
        switch (priority) {
            case 'urgent': return <Flag {...iconProps} className="h-4 w-4 pm-priority-urgent" />;
            case 'high': return <Flag {...iconProps} className="h-4 w-4 pm-priority-high" />;
            case 'medium': return <Flag {...iconProps} className="h-4 w-4 pm-priority-medium" />;
            case 'low': return <Flag {...iconProps} className="h-4 w-4 pm-priority-low" />;
            default: return <Flag {...iconProps} className="h-4 w-4 pm-priority-low" />;
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'pm-priority-urgent';
            case 'high': return 'pm-priority-high';
            case 'medium': return 'pm-priority-medium';
            case 'low': return 'pm-priority-low';
            default: return 'pm-priority-low';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isOverdue = (dueDateString: string | undefined, status: string) => {
        if (!dueDateString || status === 'done') return false;
        return new Date(dueDateString) < new Date();
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <Kanban className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Tasks Yet</h3>
                <p className="text-slate-500 mb-6">Create your first task to start tracking your work progress.</p>
                <Button 
                    onClick={() => onCreateTask?.()}
                    variant="default"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Task
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!compact && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200">Tasks</h3>
                        <p className="text-sm text-slate-500">View and manage your tasks</p>
                    </div>
                    <Button 
                        onClick={() => onCreateTask?.()}
                        size="sm"
                        variant="default"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                {tasks.map((task) => {
                    const overdue = isOverdue(task.due_date, task.status);
                    
                    return (
                        <div
                            key={task.id}
                            className={`group pm-card ${overdue ? 'pm-overdue-card' : ''}`}
                        >
                            {/* Header with Title and Action */}
                            <div className="pm-card-header">
                                <div className="flex-1 min-w-0">
                                    <h4 className="pm-card-title">
                                        {task.title}
                                    </h4>
                                    <p className="pm-card-subtitle">
                                        {task.project_name}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="pm-card-action"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 pm-dropdown-content">
                                        <DropdownMenuItem className="pm-dropdown-item">View Details</DropdownMenuItem>
                                        <DropdownMenuItem className="pm-dropdown-item">Edit Task</DropdownMenuItem>
                                        <DropdownMenuItem className="pm-dropdown-item">Log Time</DropdownMenuItem>
                                        <DropdownMenuItem className="pm-dropdown-item">Add Comment</DropdownMenuItem>
                                        <DropdownMenuItem className="pm-dropdown-item danger">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Status and Priority Row */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`pm-status-badge ${getStatusClass(task.status)}`}>
                                    {getStatusIcon(task.status)}
                                    {task.status.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className={`pm-priority-indicator ${getPriorityClass(task.priority)}`}>
                                    {getPriorityIcon(task.priority)}
                                    <span className="capitalize">
                                        {task.priority}
                                    </span>
                                </div>
                                {overdue && (
                                    <div className="pm-overdue-badge">
                                        OVERDUE
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {task.description && (
                                <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                                    {task.description}
                                </p>
                            )}

                            {/* Footer with metadata */}
                            <div className="pm-card-footer">
                                <div className="pm-metadata-group">
                                    <div className="pm-metadata-item">
                                        <User className="h-3 w-3" />
                                        <span>{task.assigned_to_name || 'Unassigned'}</span>
                                    </div>
                                    {task.due_date && (
                                        <div className="pm-metadata-item">
                                            <Calendar className="h-3 w-3" />
                                            <span className={overdue ? 'text-red-400 font-medium' : ''}>
                                                {formatDate(task.due_date)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="pm-metadata-group">
                                    <div className="pm-metadata-item">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {task.actual_hours.toFixed(1)}h
                                            {task.estimated_hours && (
                                                <span className="text-slate-400">
                                                    /{task.estimated_hours.toFixed(1)}h
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <span>
                                        {task.comment_count} comments
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {compact && tasks.length > 5 && (
                <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                        View All Tasks
                    </Button>
                </div>
            )}
            
        </div>
    );
}