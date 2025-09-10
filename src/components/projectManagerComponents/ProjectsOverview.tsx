'use client';
import { Plus, FolderOpen, Calendar, Users, Clock, MoreHorizontal, Flag, CheckCircle2, CircleDot, Pause, Archive, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ProjectWithStats } from '@/types/project';

interface ProjectsOverviewProps {
    projects: ProjectWithStats[];
    compact?: boolean;
    onCreateProject?: () => void;
    onViewDetails?: (project: ProjectWithStats) => void;
    onEditProject?: (project: ProjectWithStats) => void;
    onAddTask?: (project: ProjectWithStats) => void;
    onDeleteProject?: (project: ProjectWithStats) => void;
}

export default function ProjectsOverview({ projects, compact = false, onCreateProject, onViewDetails, onEditProject, onAddTask, onDeleteProject }: ProjectsOverviewProps) {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Play className="h-3 w-3" />;
            case 'completed': return <CheckCircle2 className="h-3 w-3" />;
            case 'on_hold': return <Pause className="h-3 w-3" />;
            case 'archived': return <Archive className="h-3 w-3" />;
            default: return <CircleDot className="h-3 w-3" />;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return 'pm-status-done'; // Green for active
            case 'completed': return 'pm-status-progress'; // Blue for completed
            case 'on_hold': return 'pm-status-review'; // Amber for on hold
            case 'archived': return 'pm-status-backlog'; // Gray for archived
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

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Projects Yet</h3>
                <p className="text-slate-500 mb-6">Create your first project to get started tracking tasks and progress.</p>
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
        <div className="space-y-4">
            {!compact && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200">Projects</h3>
                        <p className="text-sm text-slate-500">Manage and track your projects</p>
                    </div>
                    <Button 
                        onClick={() => onCreateProject?.()}
                        size="sm"
                        variant="default"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                {projects.map((project) => {
                    const completionRate = project.total_tasks > 0 
                        ? (project.completed_tasks / project.total_tasks) * 100 
                        : 0;

                    return (
                        <div
                            key={project.id}
                            className="group pm-card"
                        >
                            {/* Header with Title and Action */}
                            <div className="pm-card-header">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FolderOpen className="h-4 w-4 text-blue-400" />
                                        <h4 className="pm-card-title text-base">
                                            {project.name}
                                        </h4>
                                    </div>
                                    {project.description && (
                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                            {project.description}
                                        </p>
                                    )}
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
                                        <DropdownMenuItem 
                                            className="pm-dropdown-item"
                                            onClick={() => onViewDetails?.(project)}
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
                            </div>

                            {/* Status and Priority Row */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`pm-status-badge ${getStatusClass(project.status)}`}>
                                    {getStatusIcon(project.status)}
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className={`pm-priority-indicator ${getPriorityClass(project.priority)}`}>
                                    {getPriorityIcon(project.priority)}
                                    <span className="capitalize">
                                        {project.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="pm-progress-section">
                                <div className="pm-progress-header">
                                    <span className="pm-progress-label">Project Progress</span>
                                    <span className="pm-progress-value">
                                        {completionRate.toFixed(0)}% complete
                                    </span>
                                </div>
                                <Progress 
                                    value={completionRate} 
                                    className="h-2"
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-slate-500">
                                        {project.completed_tasks} of {project.total_tasks} tasks completed
                                    </span>
                                </div>
                            </div>

                            {/* Footer with metadata */}
                            <div className="pm-card-footer">
                                <div className="pm-metadata-group">
                                    {project.due_date && (
                                        <div className="pm-metadata-item">
                                            <Calendar className="h-3 w-3" />
                                            <span>Due {formatDate(project.due_date)}</span>
                                        </div>
                                    )}
                                    <div className="pm-metadata-item">
                                        <Users className="h-3 w-3" />
                                        <span>{project.total_tasks} tasks</span>
                                    </div>
                                </div>
                                <div className="pm-metadata-item">
                                    <Clock className="h-3 w-3" />
                                    <span>{project.total_hours_logged.toFixed(1)}h logged</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {compact && projects.length > 5 && (
                <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                        View All Projects
                    </Button>
                </div>
            )}
            
        </div>
    );
}