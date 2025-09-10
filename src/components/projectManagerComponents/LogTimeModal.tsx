'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Clock, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createTimeEntry, CreateTimeEntryData } from '@/app/lib/services/projectManagerServices/timeEntryServices';
import { toast } from 'sonner';
import type { TaskWithDetails } from '@/types/task';

const timeEntrySchema = z.object({
    minutes: z.number().min(1, "Time must be at least 1 minute").max(1440, "Time cannot exceed 24 hours"),
    description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
    entry_date: z.string().min(1, "Date is required"),
});

interface LogTimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: TaskWithDetails;
}

type FormData = z.infer<typeof timeEntrySchema>;

export default function LogTimeModal({ isOpen, onClose, task }: LogTimeModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
        resolver: zodResolver(timeEntrySchema),
        defaultValues: {
            minutes: 0,
            description: '',
            entry_date: new Date().toISOString().split('T')[0],
        }
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        toast.loading('Logging time...', { id: 'log-time' });

        try {
            const timeEntryData: CreateTimeEntryData = {
                task_id: task.id,
                minutes: data.minutes,
                description: data.description,
                entry_date: data.entry_date,
            };

            await createTimeEntry(timeEntryData);
            
            toast.success(`Logged ${data.minutes} minutes to "${task.title}"`, { id: 'log-time' });
            router.refresh();
            handleClose();
        } catch (error) {
            console.error('Error logging time:', error);
            toast.error('Failed to log time. Please try again.', { id: 'log-time' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickTime = (minutes: number) => {
        setValue('minutes', minutes);
    };

    const formatHours = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Log Time
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-60">
                                {task.title}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Date */}
                    <div>
                        <Label htmlFor="entry_date" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <Calendar className="h-4 w-4" />
                            Date
                        </Label>
                        <Input
                            id="entry_date"
                            type="date"
                            {...register('entry_date')}
                            className="w-full"
                        />
                        {errors.entry_date && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.entry_date.message}</p>
                        )}
                    </div>

                    {/* Time */}
                    <div>
                        <Label htmlFor="minutes" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <Clock className="h-4 w-4" />
                            Time Spent
                        </Label>
                        
                        {/* Quick Time Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {[15, 30, 60, 120].map((minutes) => (
                                <Button
                                    key={minutes}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickTime(minutes)}
                                    className="text-xs"
                                >
                                    {formatHours(minutes)}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Input
                                id="minutes"
                                type="number"
                                min="1"
                                max="1440"
                                placeholder="120"
                                {...register('minutes', { valueAsNumber: true })}
                                className="flex-1"
                            />
                            <span className="text-sm text-slate-500 dark:text-slate-400 min-w-fit">
                                minutes ({watch('minutes') ? formatHours(watch('minutes')) : '0m'})
                            </span>
                        </div>
                        {errors.minutes && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.minutes.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <MessageSquare className="h-4 w-4" />
                            Work Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what you worked on..."
                            {...register('description')}
                            className="min-h-[80px] resize-none"
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Logging...
                                </>
                            ) : (
                                <>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Log Time
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}