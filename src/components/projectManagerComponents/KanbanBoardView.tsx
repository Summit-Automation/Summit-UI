'use client';

import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, MoreHorizontal, User, Calendar, Clock, Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Avatar from 'react-avatar';
import { isOverdue, formatDate } from '@/utils/dateUtils';

import type { TaskWithDetails } from '@/types/task';
import { updateTask } from '@/app/lib/services/projectManagerServices/updateTask';
import { isError } from '@/types/result';
import LogTimeModal from './LogTimeModal';
import TaskDetailsModal from './TaskDetailsModal';

interface KanbanBoardViewProps {
    tasks: TaskWithDetails[];
    onCreateTask?: () => void;
    onEditTask?: (task: TaskWithDetails) => void;
    onDeleteTask?: (task: TaskWithDetails) => void;
}


type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string; bgColor: string; borderColor: string; iconColor: string }> = [
    { 
        id: 'backlog', 
        title: 'Backlog', 
        color: 'text-slate-700 dark:text-slate-300', 
        bgColor: 'bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50',
        borderColor: 'border-slate-200 dark:border-slate-700',
        iconColor: 'text-slate-500'
    },
    { 
        id: 'in_progress', 
        title: 'In Progress', 
        color: 'text-blue-700 dark:text-blue-300', 
        bgColor: 'bg-gradient-to-b from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/10',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
        id: 'review', 
        title: 'Review', 
        color: 'text-amber-700 dark:text-amber-300', 
        bgColor: 'bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-900/10',
        borderColor: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400'
    },
    { 
        id: 'done', 
        title: 'Done', 
        color: 'text-emerald-700 dark:text-emerald-300', 
        bgColor: 'bg-gradient-to-b from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-900/10',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
];

interface DraggableTaskCardProps {
    task: TaskWithDetails;
    onEditTask?: (task: TaskWithDetails) => void;
    onDeleteTask?: (task: TaskWithDetails) => void;
    onLogTime?: (task: TaskWithDetails) => void;
    onOpenDetails?: (task: TaskWithDetails) => void;
    isDragging?: boolean;
}

const SortableTaskCard = memo(function SortableTaskCard({ task, onEditTask, onDeleteTask, onLogTime, onOpenDetails }: DraggableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: task.id,
        transition: {
            duration: 150,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <TaskCard 
                task={task} 
                onEditTask={onEditTask} 
                onDeleteTask={onDeleteTask} 
                onLogTime={onLogTime}
                onOpenDetails={onOpenDetails}
                isDragging={isDragging} 
            />
        </div>
    );
});

const TaskCard = memo(function TaskCard({ task, onEditTask, onDeleteTask, onLogTime, onOpenDetails, isDragging = false }: DraggableTaskCardProps) {
    // Performance: Use static date for SSR compatibility and reduce re-renders
    const [currentDate] = useState<Date>(() => new Date());
    
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const overdue = isOverdue(task.due_date, task.status, currentDate);

    return (
        <Card 
            className={`bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-shadow duration-150 cursor-pointer group select-none ${isDragging ? 'opacity-50' : ''} ${overdue ? 'border-red-300/80 dark:border-red-700/80 bg-gradient-to-br from-red-50 to-red-100/30 dark:from-red-900/20 dark:to-red-900/10' : ''}`}
            onClick={() => onOpenDetails?.(task)}
        >
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className={`h-1 w-full rounded-full ${getPriorityColor(task.priority).replace('text-', 'bg-')} opacity-70`}></div>

                    <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 flex-1 leading-relaxed">
                            {task.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 rounded-md transition-opacity duration-150"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg z-50 p-1">
                                    <DropdownMenuItem 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditTask?.(task);
                                        }} 
                                        className="gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                                    >
                                        <User className="h-3 w-3" />
                                        Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteTask?.(task);
                                        }}
                                    >
                                        <AlertTriangle className="h-3 w-3" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-normal border-slate-300/60 dark:border-slate-600/60">
                            {task.project_name}
                        </Badge>
                        <div className="flex items-center gap-1">
                            <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
                            <span className={`text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            {task.assigned_to_name ? (
                                <>
                                    <Avatar
                                        name={task.assigned_to_name}
                                        size="20"
                                        round
                                        textSizeRatio={2}
                                        className="flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                                    />
                                    <span className="truncate font-medium">{task.assigned_to_name}</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                        <User className="h-3 w-3 text-slate-400" />
                                    </div>
                                    <span className="text-slate-400">Unassigned</span>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1.5 text-xs">
                                {task.due_date ? (
                                    <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(task.due_date, { month: 'short', day: 'numeric' })}</span>
                                        {overdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>No due date</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs">
                                <Clock className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    {task.actual_hours.toFixed(1)}h
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLogTime?.(task);
                            }}
                            className="w-full h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                        >
                            <Clock className="h-3 w-3 mr-1.5" />
                            Log Time
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

const KanbanColumn = memo(function KanbanColumn({ 
    column, 
    tasks, 
    onCreateTask, 
    onEditTask, 
    onDeleteTask,
    onLogTime,
    onOpenDetails
}: { 
    column: typeof COLUMNS[0]; 
    tasks: TaskWithDetails[];
    onCreateTask?: () => void;
    onEditTask?: (task: TaskWithDetails) => void;
    onDeleteTask?: (task: TaskWithDetails) => void;
    onLogTime?: (task: TaskWithDetails) => void;
    onOpenDetails?: (task: TaskWithDetails) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    return (
        <div 
            ref={setNodeRef}
            className={`flex flex-col h-full transition-colors duration-200 ${
                isOver ? 'bg-blue-50 dark:bg-blue-900/10 ring-2 ring-blue-200 dark:ring-blue-800 rounded-lg' : ''
            }`}
        >
            <div className={`${column.bgColor} ${column.borderColor} border rounded-t-xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${column.iconColor.replace('text-', 'bg-')}`}></div>
                        <h3 className={`font-semibold text-sm ${column.color} uppercase tracking-wide`}>
                            {column.title}
                        </h3>
                        <Badge 
                            variant="secondary" 
                            className={`text-xs h-5 px-2 ${column.iconColor} bg-white/80 dark:bg-slate-800/80 font-medium`}
                        >
                            {tasks.length}
                        </Badge>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 w-7 p-0 rounded-lg transition-transform duration-150 hover:scale-110 ${column.iconColor} hover:bg-white/70 dark:hover:bg-slate-800/70`}
                        onClick={onCreateTask}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className={`flex-1 p-3 space-y-3 bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-900/50 ${column.borderColor} border-l border-r border-b rounded-b-xl min-h-[400px] lg:min-h-[500px] lg:max-h-[calc(100vh-300px)] max-h-[60vh] overflow-y-auto backdrop-blur-sm`}>
                <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            onEditTask={onEditTask}
                            onDeleteTask={onDeleteTask}
                            onLogTime={onLogTime}
                            onOpenDetails={onOpenDetails}
                        />
                    ))}
                </SortableContext>
                
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                            <Plus className="h-4 w-4" />
                        </div>
                        <p className="text-sm">Drop tasks here</p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default function KanbanBoardView({ 
    tasks, 
    onCreateTask, 
    onEditTask, 
    onDeleteTask 
}: KanbanBoardViewProps) {
    const router = useRouter();
    const [draggedTask, setDraggedTask] = useState<TaskWithDetails | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showLogTimeModal, setShowLogTimeModal] = useState(false);
    const [selectedTaskForTimeLog, setSelectedTaskForTimeLog] = useState<TaskWithDetails | null>(null);
    const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
    const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<TaskWithDetails | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Fix hydration error by only rendering DndContext on client
    useEffect(() => {
        setIsClient(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Slightly higher to prevent accidental drags
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100, // Reduced delay for better responsiveness
                tolerance: 5,
            },
        })
    );

    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, TaskWithDetails[]> = {
            backlog: [],
            in_progress: [],
            review: [],
            done: []
        };

        tasks.forEach(task => {
            if (task.status in grouped) {
                grouped[task.status as TaskStatus].push(task);
            } else {
                grouped.backlog.push(task); // fallback for unknown statuses
            }
        });

        return grouped;
    }, [tasks]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        if (task) {
            setDraggedTask(task);
            // Performance: Disable pointer events on non-droppable areas during drag
            document.body.style.userSelect = 'none';
        }
    }, [tasks]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        
        setDraggedTask(null);
        // Performance: Re-enable user selection
        document.body.style.userSelect = '';
        
        if (!over || isUpdating) return;

        const activeTask = tasks.find(t => t.id === active.id);
        if (!activeTask) return;

        let newStatus: TaskStatus | null = null;
        
        const targetColumn = COLUMNS.find(col => over.id === col.id);
        if (targetColumn) {
            newStatus = targetColumn.id;
        } else {
            // Check if dropped on another task, then use that task's status
            const targetTask = tasks.find(t => t.id === over.id);
            if (targetTask) {
                newStatus = targetTask.status as TaskStatus;
            }
        }

        // Security validation: Only allow valid status transitions
        const validStatuses = ['backlog', 'in_progress', 'review', 'done'] as const;
        const isValidStatus = (status: string): status is TaskStatus => {
            return validStatuses.includes(status as TaskStatus);
        };
        
        if (newStatus && 
            newStatus !== activeTask.status && 
            isValidStatus(newStatus) &&
            typeof activeTask.id === 'string' && 
            activeTask.id.length > 0) {
            
            setIsUpdating(true);
            toast.loading('Updating task status...', { id: 'task-update' });
            
            try {
                // Validate task ownership/permissions before update
                const result = await updateTask(activeTask.id, { status: newStatus });
                
                if (isError(result)) {
                    console.error('Failed to update task status:', result.error);
                    toast.error('Failed to update task status. Please try again.', { id: 'task-update' });
                    return;
                }
                
                toast.success('Task status updated successfully', { id: 'task-update' });
                // Refresh the page to show updated data
                router.refresh();
            } catch (error) {
                console.error('Error updating task status:', error);
                toast.error('An unexpected error occurred. Please try again.', { id: 'task-update' });
            } finally {
                setIsUpdating(false);
            }
        }
    }, [tasks, router, isUpdating]);

    const handleLogTime = useCallback((task: TaskWithDetails) => {
        setSelectedTaskForTimeLog(task);
        setShowLogTimeModal(true);
    }, []);

    const handleCloseTimeLogModal = () => {
        setShowLogTimeModal(false);
        setSelectedTaskForTimeLog(null);
    };

    const handleOpenTaskDetails = useCallback((task: TaskWithDetails) => {
        setSelectedTaskForDetails(task);
        setShowTaskDetailsModal(true);
    }, []);

    const handleCloseTaskDetails = () => {
        setShowTaskDetailsModal(false);
        setSelectedTaskForDetails(null);
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        No Tasks Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Create your first task to get started with the board view.
                    </p>
                    <Button onClick={onCreateTask} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Task
                    </Button>
                </div>
            </div>
        );
    }

    // Render static version during SSR to prevent hydration mismatches
    if (!isClient) {
        return (
            <div className="h-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Project Board
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Drag and drop tasks between columns
                        </p>
                    </div>
                    <Button onClick={onCreateTask} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </div>

                {/* SSR-safe static board */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 h-[calc(100vh-200px)] overflow-x-auto min-w-0">
                    {COLUMNS.map((column) => {
                        const columnTasks = tasksByStatus[column.id] || [];
                        return (
                            <div key={column.id} className="w-80 flex-shrink-0 lg:w-auto">
                                <div className={`flex flex-col h-full`}>
                                    <div className={`${column.bgColor} ${column.borderColor} border rounded-t-xl p-4 shadow-sm`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${column.iconColor.replace('text-', 'bg-')}`}></div>
                                                <h3 className={`font-semibold text-sm ${column.color} uppercase tracking-wide`}>
                                                    {column.title}
                                                </h3>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`text-xs h-5 px-2 ${column.iconColor} bg-white/80 dark:bg-slate-800/80 font-medium`}
                                                >
                                                    {columnTasks.length}
                                                </Badge>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={`h-7 w-7 p-0 rounded-lg transition-transform duration-150 hover:scale-110 ${column.iconColor} hover:bg-white/70 dark:hover:bg-slate-800/70`}
                                                onClick={onCreateTask}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className={`flex-1 p-3 space-y-3 bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-900/50 ${column.borderColor} border-l border-r border-b rounded-b-xl min-h-[400px] sm:min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto backdrop-blur-sm`}>
                                        {columnTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onEditTask={onEditTask}
                                                onDeleteTask={onDeleteTask}
                                                onLogTime={handleLogTime}
                                                onOpenDetails={handleOpenTaskDetails}
                                            />
                                        ))}
                                        
                                        {columnTasks.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                                                    <Plus className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm">Drop tasks here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Project Board
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Drag and drop tasks between columns
                        </p>
                    </div>
                    <Button onClick={onCreateTask} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </div>

                <div className="w-full">
                    <div className="lg:hidden">
                        <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4">
                            {COLUMNS.map((column) => {
                                const columnTasks = tasksByStatus[column.id] || [];
                                return (
                                    <div key={column.id} className="w-72 flex-shrink-0">
                                        <KanbanColumn
                                            column={column}
                                            tasks={columnTasks}
                                            onCreateTask={onCreateTask}
                                            onEditTask={onEditTask}
                                            onDeleteTask={onDeleteTask}
                                            onLogTime={handleLogTime}
                                            onOpenDetails={handleOpenTaskDetails}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                        {COLUMNS.map((column) => {
                            const columnTasks = tasksByStatus[column.id] || [];
                            return (
                                <div key={column.id} id={column.id} className={`flex flex-col ${isUpdating ? 'pointer-events-none opacity-60' : ''}`}>
                                    <KanbanColumn
                                        column={column}
                                        tasks={columnTasks}
                                        onCreateTask={onCreateTask}
                                        onEditTask={onEditTask}
                                        onDeleteTask={onDeleteTask}
                                        onLogTime={handleLogTime}
                                        onOpenDetails={handleOpenTaskDetails}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <DragOverlay
                adjustScale={false}
                modifiers={[snapCenterToCursor]}
                dropAnimation={{
                    duration: 200,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}
            >
                {draggedTask ? (
                    <div className="opacity-90 rotate-2 scale-105">
                        <TaskCard
                            task={draggedTask}
                            onEditTask={onEditTask}
                            onDeleteTask={onDeleteTask}
                            onLogTime={handleLogTime}
                            onOpenDetails={handleOpenTaskDetails}
                            isDragging={true}
                        />
                    </div>
                ) : null}
            </DragOverlay>

            {showLogTimeModal && selectedTaskForTimeLog && (
                <LogTimeModal
                    isOpen={showLogTimeModal}
                    onClose={handleCloseTimeLogModal}
                    task={selectedTaskForTimeLog}
                />
            )}

            {showTaskDetailsModal && selectedTaskForDetails && (
                <TaskDetailsModal
                    isOpen={showTaskDetailsModal}
                    onClose={handleCloseTaskDetails}
                    task={selectedTaskForDetails}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onLogTime={handleLogTime}
                />
            )}
        </DndContext>
    );
}