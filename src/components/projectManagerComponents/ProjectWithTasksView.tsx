'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Plus, FolderOpen, Calendar, Users, Clock, MoreHorizontal, Flag, CheckCircle2, CircleDot, Pause, Archive, Play, Timer, AlertTriangle, ChevronDown, ChevronRight, Kanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ProjectWithStats } from '@/types/project';
import type { TaskWithDetails } from '@/types/task';

interface ProjectWithTasksViewProps {
    projects: ProjectWithStats[];
    tasks: TaskWithDetails[];
    onCreateProject?: () => void;
    onViewProjectDetails?: (project: ProjectWithStats) => void;
    onEditProject?: (project: ProjectWithStats) => void;
    onAddTask?: (project: ProjectWithStats) => void;
    onDeleteProject?: (project: ProjectWithStats) => void;
    onEditTask?: (task: TaskWithDetails) => void;
    onDeleteTask?: (task: TaskWithDetails) => void;
}

function ProjectWithTasksView({ 
    projects, 
    tasks, 
    onCreateProject, 
    onViewProjectDetails, 
    onEditProject, 
    onAddTask, 
    onDeleteProject,
    onEditTask,
    onDeleteTask
}: ProjectWithTasksViewProps) {
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    const toggleProject = useCallback((projectId: string) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
        }
        setExpandedProjects(newExpanded);
    }, [expandedProjects]);

    // Memoize tasks grouped by project to avoid filtering on every render
    const tasksByProject = useMemo(() => {
        const grouped: Record<string, TaskWithDetails[]> = {};
        tasks.forEach(task => {
            if (!grouped[task.project_id]) {
                grouped[task.project_id] = [];
            }
            grouped[task.project_id].push(task);
        });
        return grouped;
    }, [tasks]);

    const getProjectTasks = useCallback((projectId: string) => {
        return tasksByProject[projectId] || [];
    }, [tasksByProject]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Play className="h-3 w-3" />;
            case 'completed': return <CheckCircle2 className="h-3 w-3" />;
            case 'on_hold': return <Pause className="h-3 w-3" />;
            case 'archived': return <Archive className="h-3 w-3" />;
            default: return <CircleDot className="h-3 w-3" />;
        }
    };

    const getProjectStatusClass = (status: string) => {
        switch (status) {
            case 'active': return 'pm-status-done';
            case 'completed': return 'pm-status-progress';
            case 'on_hold': return 'pm-status-review';
            case 'archived': return 'pm-status-backlog';
            default: return 'pm-status-backlog';
        }
    };

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'backlog': return <CircleDot className="h-3 w-3" />;
            case 'in_progress': return <Timer className="h-3 w-3" />;
            case 'review': return <AlertTriangle className="h-3 w-3" />;
            case 'done': return <CheckCircle2 className="h-3 w-3" />;
            case 'blocked': return <AlertTriangle className="h-3 w-3" />;
            default: return <CircleDot className="h-3 w-3" />;
        }
    };

    const getTaskStatusClass = (status: string) => {
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

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Projects Yet</h3>
                <p className="text-slate-500 mb-6">Create your first project to get started with task management.</p>
                <Button 
                    onClick={() => onCreateProject?.()}
                    variant="default"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Project
                </Button>
            </div>
        );
    }

    return (
        <main role="main" aria-label="Project and Task Management">
            <div className="space-y-4">
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-200">Projects & Tasks</h2>
                        <p className="text-sm text-slate-500">Organized by project like Jira</p>
                    </div>
                    <Button 
                        onClick={() => onCreateProject?.()}
                        size="sm"
                        variant="default"
                        aria-describedby="create-project-description"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                    <span id="create-project-description" className="sr-only">
                        Create a new project to organize your tasks
                    </span>
                </header>

                <section className="space-y-4" aria-label="Projects list">
                {projects.map((project) => {
                    const projectTasks = getProjectTasks(project.id);
                    const isExpanded = expandedProjects.has(project.id);
                    const completionRate = project.total_tasks > 0 
                        ? (project.completed_tasks / project.total_tasks) * 100 
                        : 0;

                    return (
                        <article key={project.id} className="pm-card" aria-labelledby={`project-${project.id}-title`}>
                            <Collapsible open={isExpanded} onOpenChange={() => toggleProject(project.id)}>
                                {/* Project Header */}
                                <header className="pm-card-header">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-1 h-auto hover:bg-slate-700/50"
                                                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} project ${project.name}`}
                                                aria-expanded={isExpanded}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>
                                        
                                        <FolderOpen className="h-4 w-4 text-blue-400" />
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 id={`project-${project.id}-title`} className="pm-card-title text-base font-medium">
                                                {project.name}
                                            </h3>
                                            {project.description && (
                                                <p className="text-sm text-slate-400 line-clamp-1 leading-relaxed mt-1">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {projectTasks.length} tasks
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="pm-card-action"
                                                aria-label={`Project actions for ${project.name}`}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 pm-dropdown-content">
                                            <DropdownMenuItem 
                                                className="pm-dropdown-item"
                                                onClick={() => onViewProjectDetails?.(project)}
                                            >
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="pm-dropdown-item"
                                                onClick={() => onEditProject?.(project)}
                                            >
                                                Edit Project
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="pm-dropdown-item"
                                                onClick={() => onAddTask?.(project)}
                                            >
                                                Add Task
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="pm-dropdown-item danger"
                                                onClick={() => onDeleteProject?.(project)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </header>

                                {/* Project Status and Progress */}
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`pm-status-badge ${getProjectStatusClass(project.status)}`}>
                                        {getStatusIcon(project.status)}
                                        {project.status.replace('_', ' ').toUpperCase()}
                                    </div>
                                    <div className={`pm-priority-indicator ${getPriorityClass(project.priority)}`}>
                                        {getPriorityIcon(project.priority)}
                                        <span className="capitalize">{project.priority}</span>
                                    </div>
                                    <div className="pm-metadata-item">
                                        <Clock className="h-3 w-3" />
                                        <span>{project.total_hours_logged.toFixed(1)}h logged</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="pm-progress-section mb-4" role="group" aria-labelledby={`progress-${project.id}`}>
                                    <div className="pm-progress-header">
                                        <span id={`progress-${project.id}`} className="pm-progress-label">Progress</span>
                                        <span className="pm-progress-value">{completionRate.toFixed(0)}% complete</span>
                                    </div>
                                    <Progress 
                                        value={completionRate} 
                                        className="h-2" 
                                        aria-labelledby={`progress-${project.id}`}
                                        aria-valuenow={completionRate}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuetext={`${completionRate.toFixed(0)}% complete`}
                                    />
                                </div>

                                {/* Collapsible Tasks */}
                                <CollapsibleContent>
                                    <div className="border-t border-slate-700/50 pt-4" role="region" aria-labelledby={`tasks-${project.id}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 id={`tasks-${project.id}`} className="text-sm font-medium text-slate-300">Tasks ({projectTasks.length})</h5>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onAddTask?.(project)}
                                                className="text-xs h-7"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Task
                                            </Button>
                                        </div>

                                        {projectTasks.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Kanban className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                                                <p className="text-sm text-slate-500 mb-3">No tasks in this project yet</p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onAddTask?.(project)}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add First Task
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {projectTasks.map((task) => {
                                                    const overdue = isOverdue(task.due_date, task.status);
                                                    
                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className={`bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 hover:border-slate-600/50 transition-colors ${overdue ? 'border-red-500/30 bg-red-500/5' : ''}`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <h6 className="text-sm font-medium text-slate-200 mb-1">
                                                                        {task.title}
                                                                    </h6>
                                                                    {task.description && (
                                                                        <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                                                                            {task.description}
                                                                        </p>
                                                                    )}
                                                                    
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className={`pm-status-badge ${getTaskStatusClass(task.status)}`}>
                                                                            {getTaskStatusIcon(task.status)}
                                                                            <span className="text-xs">{task.status.replace('_', ' ').toUpperCase()}</span>
                                                                        </div>
                                                                        <div className={`pm-priority-indicator ${getPriorityClass(task.priority)}`}>
                                                                            {getPriorityIcon(task.priority)}
                                                                            <span className="capitalize text-xs">{task.priority}</span>
                                                                        </div>
                                                                        {overdue && (
                                                                            <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
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
                                                                
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-600/50"
                                                                            aria-label={`Task actions for ${task.title}`}
                                                                        >
                                                                            <MoreHorizontal className="h-3 w-3" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-32 pm-dropdown-content">
                                                                        <DropdownMenuItem 
                                                                            className="pm-dropdown-item text-xs"
                                                                            onClick={() => onEditTask?.(task)}
                                                                        >
                                                                            Edit Task
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            className="pm-dropdown-item text-xs"
                                                                        >
                                                                            Log Time
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            className="pm-dropdown-item danger text-xs"
                                                                            onClick={() => onDeleteTask?.(task)}
                                                                        >
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </article>
                    );
                })}
                </section>
            </div>
        </main>
    );
}

export default memo(ProjectWithTasksView);