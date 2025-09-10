'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/globalComponents/Header';
import ErrorBoundary from '@/components/globalComponents/ErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Kanban, Clock, List, LayoutGrid, Menu, X } from "lucide-react";
import TimeTrackingOverview from "./TimeTrackingOverview";
import ProjectManagerSummary from "./ProjectManagerSummary";
import CreateProjectModal from "./CreateProjectModal";
import CreateTaskModal from "./CreateTaskModal";
import EditProjectModal from "./EditProjectModal";
import ProjectDetailsModal from "./ProjectDetailsModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ProjectWithTasksView from "./ProjectWithTasksView";
import KanbanBoardView from "./KanbanBoardView";
import ProjectSidebar, { TaskFilters } from "./ProjectSidebar";
import EditTaskModal from "./EditTaskModal";

import type { ProjectWithStats } from '@/types/project';
import type { TaskWithDetails } from '@/types/task';
import type { TimeEntryWithUser } from '@/types/task';
import { deleteProject } from '@/app/lib/services/projectManagerServices/updateProject';
import { deleteTask } from '@/app/lib/services/projectManagerServices/updateTask';
import { isError } from '@/types/result';

interface ProjectManagerPageContentProps {
    projects: ProjectWithStats[];
    tasks: TaskWithDetails[];
    timeEntries: TimeEntryWithUser[];
}

type ViewMode = 'list' | 'board';

export default function ProjectManagerPageContent({ projects, tasks, timeEntries }: ProjectManagerPageContentProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>('board');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [filters, setFilters] = useState<TaskFilters>({
        search: '',
        status: [],
        priority: [],
        assignee: [],
        projectId: []
    });
    const [selectedProjectForSidebar, setSelectedProjectForSidebar] = useState<string | undefined>();
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
    const [preselectedProjectId, setPreselectedProjectId] = useState<string | undefined>();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteType, setDeleteType] = useState<'project' | 'task'>('project');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Filter tasks based on current filters
    const filteredTasks = tasks.filter(task => {
        // Search filter
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
            !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }

        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(task.status)) {
            return false;
        }

        // Priority filter
        if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
            return false;
        }

        // Assignee filter
        if (filters.assignee.length > 0 && (!task.assigned_to || !filters.assignee.includes(task.assigned_to))) {
            return false;
        }

        // Project filter
        if (filters.projectId.length > 0 && !filters.projectId.includes(task.project_id)) {
            return false;
        }

        return true;
    });

    const handleSettings = () => router.push('/settings');
    const handleHelp = () => {
        // Navigate to dashboard help
        router.push('/?tab=help');
    };

    const handleViewDetails = (project: ProjectWithStats) => {
        setSelectedProject(project);
        setShowProjectDetailsModal(true);
    };

    const handleEditProject = (project: ProjectWithStats) => {
        setSelectedProject(project);
        setShowEditProjectModal(true);
    };

    const handleAddTask = (project: ProjectWithStats) => {
        setPreselectedProjectId(project.id);
        setShowCreateTaskModal(true);
    };

    const handleDeleteProject = (project: ProjectWithStats) => {
        setSelectedProject(project);
        setShowDeleteConfirmModal(true);
    };


    const handleModalClose = () => {
        setSelectedProject(null);
        setSelectedTask(null);
        setPreselectedProjectId(undefined);
        setDeleteError(null);
    };

    const handleEditTask = (task: TaskWithDetails) => {
        setSelectedTask(task);
        setShowEditTaskModal(true);
    };

    const handleDeleteTask = (task: TaskWithDetails) => {
        setSelectedTask(task);
        setDeleteType('task');
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        setDeleteError(null);
        
        if (deleteType === 'project' && selectedProject) {
            setIsDeleting(true);
            try {
                const result = await deleteProject(selectedProject.id);
                
                if (isError(result)) {
                    setDeleteError(result.error);
                    return;
                }
                
                setShowDeleteConfirmModal(false);
                setSelectedProject(null);
                router.refresh();
            } catch (error: unknown) {
                console.error('Unexpected error in delete operation:', error);
                setDeleteError('An unexpected error occurred. Please try again.');
            } finally {
                setIsDeleting(false);
            }
        } else if (deleteType === 'task' && selectedTask) {
            setIsDeleting(true);
            try {
                const result = await deleteTask(selectedTask.id);
                
                if (isError(result)) {
                    setDeleteError(result.error);
                    return;
                }
                
                setShowDeleteConfirmModal(false);
                setSelectedTask(null);
                router.refresh();
            } catch (error: unknown) {
                console.error('Unexpected error in delete operation:', error);
                setDeleteError('An unexpected error occurred. Please try again.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <Header 
                title="Project Manager"
                subtitle="Track projects, manage tasks, and monitor time efficiently"
                onSettings={handleSettings}
                onHelp={handleHelp}
            />

            <div className="flex h-[calc(100vh-120px)] relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 fixed lg:relative z-50 lg:z-auto transition-transform duration-300 ease-in-out`}>
                    <ProjectSidebar
                        projects={projects}
                        tasks={tasks}
                        onCreateProject={() => setShowCreateProjectModal(true)}
                        onSelectProject={(project) => setSelectedProjectForSidebar(project.id)}
                        onFiltersChange={setFilters}
                        selectedProjectId={selectedProjectForSidebar}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden lg:ml-0">
                    {/* Mobile Header with Sidebar Toggle */}
                    <div className="lg:hidden flex items-center p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="mr-2"
                        >
                            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Project Manager
                        </h1>
                    </div>

                    <div className="p-6 h-full space-y-6 overflow-y-auto">

                {/* Summary - Always Visible */}
                <div className="w-full">
                    <ErrorBoundary>
                        <ProjectManagerSummary 
                            projects={projects} 
                            tasks={filteredTasks} 
                            timeEntries={timeEntries}
                        />
                    </ErrorBoundary>
                </div>

                {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
                <div className="hidden lg:block space-y-6">
                    {/* Main Project & Tasks View - Jira Style */}
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm p-6">
                        <CardHeader className="pb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                        <div className="p-2.5 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-all duration-300">
                                            {viewMode === 'board' ? (
                                                <LayoutGrid className="h-5 w-5 text-blue-400"/>
                                            ) : (
                                                <List className="h-5 w-5 text-blue-400"/>
                                            )}
                                        </div>
                                        Project Manager
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 text-sm mt-2">
                                        {viewMode === 'board' ? 'Kanban board view of all tasks' : 'Organized view of projects and their tasks'}
                                    </CardDescription>
                                </div>
                                
                                {/* View Toggle */}
                                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'board' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('board')}
                                        className="h-8 px-3"
                                    >
                                        <LayoutGrid className="h-4 w-4 mr-2" />
                                        Board
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="h-8 px-3"
                                    >
                                        <List className="h-4 w-4 mr-2" />
                                        List
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ErrorBoundary>
                                {viewMode === 'board' ? (
                                    <KanbanBoardView
                                        tasks={filteredTasks}
                                        onCreateTask={() => setShowCreateTaskModal(true)}
                                        onEditTask={handleEditTask}
                                        onDeleteTask={handleDeleteTask}
                                    />
                                ) : (
                                    <ProjectWithTasksView 
                                        projects={projects}
                                        tasks={filteredTasks}
                                        onCreateProject={() => setShowCreateProjectModal(true)}
                                        onViewProjectDetails={handleViewDetails}
                                        onEditProject={handleEditProject}
                                        onAddTask={handleAddTask}
                                        onDeleteProject={handleDeleteProject}
                                        onEditTask={handleEditTask}
                                        onDeleteTask={handleDeleteTask}
                                    />
                                )}
                            </ErrorBoundary>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile: Tabbed Layout - Hide on desktop */}
                <div className="block lg:hidden">
                    <Tabs defaultValue="projects" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-800/30 p-1.5 rounded-xl backdrop-blur-sm">
                            <TabsTrigger 
                                value="projects" 
                                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200"
                            >
                                <Kanban className="h-4 w-4" />
                                Projects & Tasks
                            </TabsTrigger>
                            <TabsTrigger 
                                value="time" 
                                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200"
                            >
                                <Clock className="h-4 w-4" />
                                Time Tracking
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="projects" className="mt-6">
                            <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-slate-50">Project Manager</CardTitle>
                                            <CardDescription className="text-slate-400">
                                                {viewMode === 'board' ? 'Kanban board view of all tasks' : 'Organized view of projects and their tasks'}
                                            </CardDescription>
                                        </div>
                                        
                                        {/* Mobile View Toggle */}
                                        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                                            <Button
                                                variant={viewMode === 'board' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('board')}
                                                className="h-7 px-2"
                                            >
                                                <LayoutGrid className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('list')}
                                                className="h-7 px-2"
                                            >
                                                <List className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ErrorBoundary>
                                        {viewMode === 'board' ? (
                                            <div className="h-[70vh] overflow-hidden">
                                                <KanbanBoardView
                                                    tasks={filteredTasks}
                                                    onCreateTask={() => setShowCreateTaskModal(true)}
                                                    onEditTask={handleEditTask}
                                                    onDeleteTask={handleDeleteTask}
                                                />
                                            </div>
                                        ) : (
                                            <ProjectWithTasksView 
                                                projects={projects}
                                                tasks={filteredTasks}
                                                onCreateProject={() => setShowCreateProjectModal(true)}
                                                onViewProjectDetails={handleViewDetails}
                                                onEditProject={handleEditProject}
                                                onAddTask={handleAddTask}
                                                onDeleteProject={handleDeleteProject}
                                                onEditTask={handleEditTask}
                                                onDeleteTask={handleDeleteTask}
                                            />
                                        )}
                                    </ErrorBoundary>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="time" className="mt-6">
                            <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-slate-50">Time Tracking</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Monitor time spent on tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ErrorBoundary>
                                        <TimeTrackingOverview timeEntries={timeEntries} />
                                    </ErrorBoundary>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateProjectModal
                isOpen={showCreateProjectModal}
                onClose={() => setShowCreateProjectModal(false)}
                onSuccess={() => {
                    setShowCreateProjectModal(false);
                    router.refresh();
                }}
            />
            
            <CreateTaskModal
                isOpen={showCreateTaskModal}
                onClose={() => {
                    setShowCreateTaskModal(false);
                    handleModalClose();
                }}
                onSuccess={() => {
                    setShowCreateTaskModal(false);
                    handleModalClose();
                    router.refresh();
                }}
                preselectedProjectId={preselectedProjectId}
            />
            
            <EditProjectModal
                isOpen={showEditProjectModal}
                onClose={() => {
                    setShowEditProjectModal(false);
                    handleModalClose();
                }}
                onSuccess={() => {
                    setShowEditProjectModal(false);
                    handleModalClose();
                    router.refresh();
                }}
                project={selectedProject}
            />
            
            <EditTaskModal
                isOpen={showEditTaskModal}
                onClose={() => {
                    setShowEditTaskModal(false);
                    handleModalClose();
                }}
                onSuccess={() => {
                    setShowEditTaskModal(false);
                    handleModalClose();
                    router.refresh();
                }}
                task={selectedTask}
            />
            
            <ProjectDetailsModal
                isOpen={showProjectDetailsModal}
                onClose={() => {
                    setShowProjectDetailsModal(false);
                    handleModalClose();
                }}
                project={selectedProject}
                onEditProject={() => {
                    setShowProjectDetailsModal(false);
                    setShowEditProjectModal(true);
                }}
                onAddTask={() => {
                    setShowProjectDetailsModal(false);
                    setPreselectedProjectId(selectedProject?.id);
                    setShowCreateTaskModal(true);
                }}
            />
            
            <DeleteConfirmationModal
                isOpen={showDeleteConfirmModal}
                onClose={() => {
                    setShowDeleteConfirmModal(false);
                    handleModalClose();
                }}
                onConfirm={confirmDelete}
                title={deleteType === 'project' ? 'Delete Project' : 'Delete Task'}
                description={deleteType === 'project' 
                    ? `Are you sure you want to delete the project "${selectedProject?.name}"?`
                    : `Are you sure you want to delete the task "${selectedTask?.title}"?`
                }
                itemName={deleteType === 'project' ? (selectedProject?.name || '') : (selectedTask?.title || '')}
                isDeleting={isDeleting}
                error={deleteError}
            />
        </div>
    );
}