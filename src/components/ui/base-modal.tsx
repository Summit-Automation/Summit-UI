'use client';

import * as React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useModal';

interface BaseModalProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    trigger: React.ReactNode;
    onSubmit?: () => Promise<boolean> | boolean;
    submitLabel?: string;
    cancelLabel?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
};

export function BaseModal({
    title,
    description,
    children,
    trigger,
    onSubmit,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    size = 'md',
    className
}: BaseModalProps) {
    const { open, setOpen, isSubmitting, setIsSubmitting, handleClose } = useModal();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onSubmit) return;
        
        setIsSubmitting(true);
        try {
            const success = await onSubmit();
            if (success) {
                handleClose();
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when modal closes
    React.useEffect(() => {
        if (!open) {
            setIsSubmitting(false);
        }
    }, [open, setIsSubmitting]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className={`${sizeClasses[size]} bg-slate-900 border border-slate-700 rounded-xl shadow-2xl ${className}`}>
                <DialogHeader>
                    <DialogTitle className="text-white">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-slate-400">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        {children}
                    </div>

                    <DialogFooter className="flex justify-end space-x-2">
                        <DialogClose asChild>
                            <Button variant="ghost" disabled={isSubmitting} type="button">
                                {cancelLabel}
                            </Button>
                        </DialogClose>
                        {onSubmit && (
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                            >
                                {isSubmitting ? 'Saving...' : submitLabel}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Specialized modals for common use cases
export function CreateModal(props: Omit<BaseModalProps, 'submitLabel'>) {
    return <BaseModal {...props} submitLabel="Create" />;
}

export function UpdateModal(props: Omit<BaseModalProps, 'submitLabel'>) {
    return <BaseModal {...props} submitLabel="Update" />;
}

export function ConfirmModal(props: Omit<BaseModalProps, 'submitLabel'>) {
    return <BaseModal {...props} submitLabel="Confirm" />;
}