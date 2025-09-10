'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, FolderOpen, Calendar, Users, Clock, Flag, Plus, Kanban, BarChart3, CheckCircle2, CircleDot, Timer, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectWithStats } from '@/types/project';
import { TaskWithDetails } from '@/types/task';
import { getTasksWithDetails } from '@/app/lib/services/projectManagerServices/getTasks';

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectWithStats | null;
    onEditProject?: () => void;
    onAddTask?: () => void;
}

export default function ProjectDetailsModal({ isOpen, onClose, project, onEditProject, onAddTask }: ProjectDetailsModalProps) {
    const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const loadProjectTasks = useCallback(async () => {
        if (!project) return;
        
        setLoadingTasks(true);
        try {
            const projectTasks = await getTasksWithDetails(project.id);
            setTasks(projectTasks);
        } catch (error) {
            console.error('Error loading project tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    }, [project]);

    useEffect(() => {
        if (isOpen && project) {
            loadProjectTasks();
        }
    }, [isOpen, project, loadProjectTasks]);

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

    if (!isOpen || !project) return null;

    const completionRate = project.total_tasks > 0 
        ? (project.completed_tasks / project.total_tasks) * 100 
        : 0;

    const tasksByStatus = {
        backlog: tasks.filter(task => task.status === 'backlog').length,
        in_progress: tasks.filter(task => task.status === 'in_progress').length,
        review: tasks.filter(task => task.status === 'review').length,
        done: tasks.filter(task => task.status === 'done').length,
        blocked: tasks.filter(task => task.status === 'blocked').length,
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <FolderOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-50">{project.name}</h2>
                            <p className="text-sm text-slate-400">Project details and tasks overview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEditProject}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                        >
                            Edit Project
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddTask}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Task
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="overview" className="h-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border-b border-slate-800/30 p-1.5">
                            <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200">
                                <BarChart3 className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200">
                                <Kanban className="h-4 w-4" />
                                Tasks ({tasks.length})
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200">
                                <BarChart3 className="h-4 w-4" />
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="p-6 space-y-6">
                            {/* Project Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-200 mb-2">Project Information</h3>
                                        {project.description && (
                                            <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={`pm-status-badge ${project.status === 'active' ? 'pm-status-done' : project.status === 'completed' ? 'pm-status-progress' : project.status === 'on_hold' ? 'pm-status-review' : 'pm-status-backlog'}`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </div>
                                        <div className={`pm-priority-indicator ${getPriorityClass(project.priority)}`}>
                                            {getPriorityIcon(project.priority)}
                                            <span className="capitalize">{project.priority}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {project.start_date && (
                                            <div className="pm-metadata-item">
                                                <Calendar className="h-4 w-4" />
                                                <span>Started {formatDate(project.start_date)}</span>
                                            </div>
                                        )}
                                        {project.due_date && (
                                            <div className="pm-metadata-item">
                                                <Calendar className="h-4 w-4" />
                                                <span>Due {formatDate(project.due_date)}</span>
                                            </div>
                                        )}
                                        <div className="pm-metadata-item">
                                            <Clock className="h-4 w-4" />
                                            <span>{project.total_hours_logged.toFixed(1)}h logged</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-200">Progress</h3>
                                    <div className="pm-progress-section">
                                        <div className="pm-progress-header">
                                            <span className="pm-progress-label">Overall Progress</span>
                                            <span className="pm-progress-value">{completionRate.toFixed(0)}% complete</span>
                                        </div>
                                        <Progress value={completionRate} className="h-3" />
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-500">
                                                {project.completed_tasks} of {project.total_tasks} tasks completed
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tasks" className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-200">Project Tasks</h3>
                                    <Button onClick={onAddTask} size="sm" variant="default">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Task
                                    </Button>
                                </div>

                                {loadingTasks ? (
                                    <div className="text-center py-8">
                                        <div className="text-slate-400">Loading tasks...</div>
                                    </div>
                                ) : tasks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Kanban className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                        <h4 className="text-lg font-semibold text-slate-300 mb-2">No Tasks Yet</h4>
                                        <p className="text-slate-500 mb-6">Create your first task for this project.</p>
                                        <Button onClick={onAddTask} variant="default">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add First Task
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {tasks.map((task) => {
                                            const overdue = isOverdue(task.due_date, task.status);
                                            
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`pm-card ${overdue ? 'pm-overdue-card' : ''}`}
                                                >
                                                    <div className="pm-card-header">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="pm-card-title text-sm">{task.title}</h4>
                                                            {task.description && (
                                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`pm-status-badge ${getStatusClass(task.status)}`}>
                                                            {getStatusIcon(task.status)}
                                                            {task.status.replace('_', ' ').toUpperCase()}
                                                        </div>
                                                        <div className={`pm-priority-indicator ${getPriorityClass(task.priority)}`}>
                                                            {getPriorityIcon(task.priority)}
                                                            <span className="capitalize">{task.priority}</span>
                                                        </div>
                                                        {overdue && (
                                                            <div className="pm-overdue-badge">OVERDUE</div>
                                                        )}
                                                    </div>

                                                    <div className="pm-card-footer">
                                                        <div className="pm-metadata-group">
                                                            <div className="pm-metadata-item">
                                                                <Users className="h-3 w-3" />
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
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics" className="p-6">
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-200">Task Analytics</h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="pm-card">
                                        <div className="pm-card-header">
                                            <div className="pm-metadata-item">
                                                <CircleDot className="h-4 w-4 text-slate-400" />
                                                <span className="font-medium">Backlog</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-200">{tasksByStatus.backlog}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="pm-card">
                                        <div className="pm-card-header">
                                            <div className="pm-metadata-item">
                                                <Timer className="h-4 w-4 text-blue-400" />
                                                <span className="font-medium">In Progress</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-200">{tasksByStatus.in_progress}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="pm-card">
                                        <div className="pm-card-header">
                                            <div className="pm-metadata-item">
                                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                                <span className="font-medium">Review</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-200">{tasksByStatus.review}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="pm-card">
                                        <div className="pm-card-header">
                                            <div className="pm-metadata-item">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                <span className="font-medium">Done</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-200">{tasksByStatus.done}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="pm-card">
                                        <div className="pm-card-header">
                                            <div className="pm-metadata-item">
                                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                                <span className="font-medium">Blocked</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-200">{tasksByStatus.blocked}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pm-card">
                                    <div className="pm-card-header">
                                        <h4 className="pm-card-title">Time Summary</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <div className="text-sm text-slate-400">Total Hours Logged</div>
                                            <div className="text-xl font-semibold text-slate-200">{project.total_hours_logged.toFixed(1)}h</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Average Hours per Task</div>
                                            <div className="text-xl font-semibold text-slate-200">
                                                {tasks.length > 0 ? (project.total_hours_logged / tasks.length).toFixed(1) : '0.0'}h
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}