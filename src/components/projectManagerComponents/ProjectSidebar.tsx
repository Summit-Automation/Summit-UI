'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Search, Filter, FolderOpen, Plus, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Avatar from 'react-avatar';

import type { ProjectWithStats } from '@/types/project';
import type { TaskWithDetails } from '@/types/task';

interface ProjectSidebarProps {
    projects: ProjectWithStats[];
    tasks: TaskWithDetails[];
    onCreateProject?: () => void;
    onSelectProject?: (project: ProjectWithStats) => void;
    onFiltersChange?: (filters: TaskFilters) => void;
    selectedProjectId?: string;
}

export interface TaskFilters {
    search: string;
    status: string[];
    priority: string[];
    assignee: string[];
    projectId: string[];
}

const TASK_STATUSES = [
    { id: 'backlog', label: 'Backlog', color: 'bg-slate-500' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', label: 'Review', color: 'bg-amber-500' },
    { id: 'done', label: 'Done', color: 'bg-emerald-500' },
    { id: 'blocked', label: 'Blocked', color: 'bg-red-500' },
];

const PRIORITIES = [
    { id: 'low', label: 'Low', color: 'text-green-600' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { id: 'high', label: 'High', color: 'text-orange-600' },
    { id: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

export default function ProjectSidebar({
    projects,
    tasks,
    onCreateProject,
    onSelectProject,
    onFiltersChange,
    selectedProjectId
}: ProjectSidebarProps) {
    const [localSearch, setLocalSearch] = useState('');
    const [debouncedSearch] = useDebounce(localSearch, 300);
    const [filters, setFilters] = useState<TaskFilters>({
        search: '',
        status: [],
        priority: [],
        assignee: [],
        projectId: []
    });
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

    // Update filters when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            const newFilters = { ...filters, search: debouncedSearch };
            setFilters(newFilters);
            onFiltersChange?.(newFilters);
        }
    }, [debouncedSearch, filters, onFiltersChange]);

    // Get unique assignees from tasks
    const uniqueAssignees = Array.from(
        new Set(
            tasks
                .filter(task => task.assigned_to_name)
                .map(task => ({ id: task.assigned_to, name: task.assigned_to_name!, email: task.assigned_to_email }))
                .filter(Boolean)
                .map(assignee => JSON.stringify(assignee))
        )
    ).map(str => JSON.parse(str));

    const handleFilterChange = (key: keyof TaskFilters, value: string | string[]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange?.(newFilters);
    };

    const toggleArrayFilter = (key: 'status' | 'priority' | 'assignee' | 'projectId', value: string) => {
        const currentArray = filters[key];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        handleFilterChange(key, newArray);
    };

    const clearAllFilters = () => {
        const emptyFilters: TaskFilters = {
            search: '',
            status: [],
            priority: [],
            assignee: [],
            projectId: []
        };
        setFilters(emptyFilters);
        onFiltersChange?.(emptyFilters);
    };

    const hasActiveFilters = filters.search || 
        filters.status.length > 0 || 
        filters.priority.length > 0 || 
        filters.assignee.length > 0 || 
        filters.projectId.length > 0;

    return (
        <div className="w-80 lg:w-80 md:w-72 sm:w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Projects
                    </h2>
                    <Button
                        onClick={onCreateProject}
                        size="sm"
                        variant="outline"
                        className="h-8"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="pl-10 h-9"
                    />
                </div>
            </div>

            {/* Quick Filters */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-between p-0 h-auto font-medium text-slate-700 dark:text-slate-300"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="h-5 text-xs">
                                        Active
                                    </Badge>
                                )}
                            </div>
                        </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4 space-y-4">
                        {hasActiveFilters && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="h-6 px-2 text-xs"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}

                        {/* Status Filter */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Status
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {TASK_STATUSES.map(status => (
                                    <Button
                                        key={status.id}
                                        variant={filters.status.includes(status.id) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleArrayFilter('status', status.id)}
                                        className="h-7 px-2 text-xs"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${status.color} mr-1`} />
                                        {status.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Priority
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {PRIORITIES.map(priority => (
                                    <Button
                                        key={priority.id}
                                        variant={filters.priority.includes(priority.id) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleArrayFilter('priority', priority.id)}
                                        className="h-7 px-2 text-xs"
                                    >
                                        <Flag className={`w-3 h-3 ${priority.color} mr-1`} />
                                        {priority.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Assignee Filter */}
                        {uniqueAssignees.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                    Assignee
                                </label>
                                <div className="space-y-1">
                                    {uniqueAssignees.slice(0, 5).map(assignee => (
                                        <Button
                                            key={assignee.id}
                                            variant={filters.assignee.includes(assignee.id) ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => toggleArrayFilter('assignee', assignee.id)}
                                            className="w-full justify-start h-8 px-2"
                                        >
                                            <Avatar
                                                name={assignee.name}
                                                size="16"
                                                round
                                                textSizeRatio={2}
                                                className="mr-2 flex-shrink-0"
                                            />
                                            <span className="text-xs truncate">{assignee.name}</span>
                                        </Button>
                                    ))}
                                    {uniqueAssignees.length > 5 && (
                                        <p className="text-xs text-slate-500 px-2">
                                            +{uniqueAssignees.length - 5} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <Collapsible open={isProjectsExpanded} onOpenChange={setIsProjectsExpanded}>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-between p-0 h-auto font-medium text-slate-700 dark:text-slate-300 mb-3"
                            >
                                <span>All Projects ({projects.length})</span>
                            </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="space-y-1">
                            {projects.map(project => {
                                const projectTasks = tasks.filter(task => task.project_id === project.id);
                                const isSelected = selectedProjectId === project.id;
                                const completionRate = project.total_tasks > 0 
                                    ? (project.completed_tasks / project.total_tasks) * 100 
                                    : 0;

                                return (
                                    <Card 
                                        key={project.id}
                                        className={`cursor-pointer transition-all duration-200 ${
                                            isSelected 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                        }`}
                                        onClick={() => onSelectProject?.(project)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-3">
                                                <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                                                        {project.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                                        {project.description || 'No description'}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <span>{projectTasks.length} tasks</span>
                                                            <span>•</span>
                                                            <span>{completionRate.toFixed(0)}% done</span>
                                                        </div>
                                                        
                                                        <Badge 
                                                            variant={
                                                                project.status === 'active' ? 'default' :
                                                                project.status === 'completed' ? 'secondary' :
                                                                'outline'
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {project.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            
                            {projects.length === 0 && (
                                <div className="text-center py-8">
                                    <FolderOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500 mb-3">No projects yet</p>
                                    <Button onClick={onCreateProject} size="sm" variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Project
                                    </Button>
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
        </div>
    );
}