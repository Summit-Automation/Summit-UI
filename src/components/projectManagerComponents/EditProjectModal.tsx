'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Flag, FileText, AlertCircle, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProject } from '@/app/lib/services/projectManagerServices/updateProject';
import { isError } from '@/types/result';
import { ProjectWithStats } from '@/types/project';

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'on_hold', 'archived'] as const),
    priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
    start_date: z.string().optional(),
    due_date: z.string().optional(),
}).refine((data) => {
    if (data.start_date && data.due_date) {
        return new Date(data.start_date) <= new Date(data.due_date);
    }
    return true;
}, {
    message: "Due date must be after start date",
    path: ["due_date"],
});

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    project: ProjectWithStats | null;
}

type FormData = z.infer<typeof projectSchema>;

export default function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'active',
            priority: 'medium',
            start_date: '',
            due_date: '',
        }
    });

    // Update form values when project changes
    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                description: project.description || '',
                status: project.status,
                priority: project.priority,
                start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
                due_date: project.due_date ? new Date(project.due_date).toISOString().split('T')[0] : '',
            });
        }
    }, [project, reset]);

    const onSubmit = async (data: FormData) => {
        if (!project) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const cleanedData = {
                name: data.name,
                description: data.description || undefined,
                status: data.status,
                priority: data.priority,
                start_date: data.start_date || undefined,
                due_date: data.due_date || undefined,
            };
            
            const result = await updateProject(project.id, cleanedData);
            
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
            console.error('Unexpected error in editProject:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Edit3 className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-50">Edit Project</h2>
                            <p className="text-sm text-slate-400">Update project details and settings</p>
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
                    {/* Project Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300 font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Project Name *
                        </Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="e.g., Website Redesign, Mobile App Development"
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                        {errors.name && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.name.message}
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
                            placeholder="Describe the project goals, scope, and key deliverables..."
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Status and Priority Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-300 font-medium flex items-center gap-2">
                                <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                                Status
                            </Label>
                            <Select onValueChange={(value) => setValue('status', value as FormData['status'])} value={watch('status')}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-50 focus:border-blue-500 focus:ring-blue-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="active" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                                            Active
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="completed" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                            Completed
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="on_hold" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
                                            On Hold
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="archived" className="text-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                                            Archived
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

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-300 font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Start Date
                            </Label>
                            <Input
                                type="date"
                                {...register('start_date')}
                                className="bg-slate-800 border-slate-700 text-slate-50 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>

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
                            {errors.due_date && (
                                <div className="flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.due_date.message}
                                </div>
                            )}
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
                            {isLoading ? 'Updating...' : 'Update Project'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}