'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Flag, Clock, FolderOpen, FileText, AlertCircle, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTask } from '@/app/lib/services/projectManagerServices/updateTask';
import { isError } from '@/types/result';
import { getProjects } from '@/app/lib/services/projectManagerServices/getProjects';
import { TaskWithDetails } from '@/types/task';
import type { Project } from '@/types/project';

const taskSchema = z.object({
    project_id: z.string().min(1, "Please select a project"),
    title: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters"),
    description: z.string().optional(),
    status: z.enum(['backlog', 'in_progress', 'review', 'done', 'blocked'] as const),
    priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
    assigned_to: z.string().optional(),
    due_date: z.string().optional(),
    estimated_hours: z.number().min(0).optional(),
});

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    task: TaskWithDetails | null;
}

type FormData = z.infer<typeof taskSchema>;

export default function EditTaskModal({ isOpen, onClose, onSuccess, task }: EditTaskModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            project_id: '',
            title: '',
            description: '',
            status: 'backlog',
            priority: 'medium',
            assigned_to: '',
            due_date: '',
            estimated_hours: undefined,
        }
    });

    // Load projects when modal opens
    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    // Update form values when task changes
    useEffect(() => {
        if (task) {
            reset({
                project_id: task.project_id,
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                assigned_to: task.assigned_to || '',
                due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
                estimated_hours: task.estimated_hours || undefined,
            });
        }
    }, [task, reset]);

    const loadProjects = async () => {
        setLoadingProjects(true);
        try {
            const projectList = await getProjects();
            setProjects(projectList);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!task) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const cleanedData = {
                title: data.title,
                description: data.description || undefined,
                status: data.status,
                priority: data.priority,
                assigned_to: data.assigned_to || undefined,
                due_date: data.due_date || undefined,
                estimated_hours: data.estimated_hours || undefined,
            };
            
            const result = await updateTask(task.id, cleanedData);
            
            if (isError(result)) {
                setError(result.error);
                return;
            }
            
            onClose();
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        } catch (error: unknown) {
            console.error('Unexpected error in editTask:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Edit3 className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-50">Edit Task</h2>
                            <p className="text-sm text-slate-400">Update task details and progress</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label className="text-slate-300 font-medium flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Project *
                        </Label>
                        <Select 
                            onValueChange={(value) => setValue('project_id', value)}
                            disabled={loadingProjects}
                            value={watch('project_id')}
                        >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-50 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select a project"} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id} className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <FolderOpen className="h-4 w-4 text-blue-400" />
                                            {project.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.project_id && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.project_id.message}
                            </div>
                        )}
                    </div>

                    {/* Task Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-300 font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Task Title *
                        </Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="e.g., Implement user authentication, Design landing page"
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                        {errors.title && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.title.message}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-300 font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Describe what needs to be done, acceptance criteria, and any important details..."
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[80px] resize-none"
                        />
                    </div>

                    {/* Status and Priority Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-300 font-medium flex items-center gap-2">
                                <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                                Status
                            </Label>
                            <Select onValueChange={(value) => setValue('status', value as FormData['status'])} value={watch('status')}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-50 focus:border-blue-500 focus:ring-blue-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="backlog" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                                            Backlog
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="in_progress" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                            In Progress
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="review" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
                                            Review
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="done" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                                            Done
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="blocked" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                                            Blocked
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300 font-medium flex items-center gap-2">
                                <Flag className="h-4 w-4" />
                                Priority
                            </Label>
                            <Select onValueChange={(value) => setValue('priority', value as FormData['priority'])} value={watch('priority')}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-50 focus:border-blue-500 focus:ring-blue-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="low" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Flag className="h-4 w-4 text-slate-400" />
                                            Low
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="medium" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Flag className="h-4 w-4 text-blue-400" />
                                            Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="high" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Flag className="h-4 w-4 text-orange-400" />
                                            High
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="urgent" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Flag className="h-4 w-4 text-red-400" />
                                            Urgent
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Due Date and Estimated Hours Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-300 font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Due Date
                            </Label>
                            <Input
                                type="date"
                                {...register('due_date')}
                                className="bg-slate-800 border-slate-700 text-slate-50 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300 font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Estimated Hours
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.5"
                                {...register('estimated_hours', { valueAsNumber: true })}
                                placeholder="0.0"
                                className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                        >
                            {isLoading ? 'Updating...' : 'Update Task'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}