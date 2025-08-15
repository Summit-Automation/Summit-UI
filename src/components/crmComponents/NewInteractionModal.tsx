'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createInteraction } from '@/app/lib/services/crmServices/interaction/createInteraction';
import { Customer } from '@/types/customer';

type FormValues = {
    customer_id: string;
    type: 'call' | 'email' | 'meeting' | 'site visit' | 'other';
    title: string;
    notes: string;
    outcome: string;
    follow_up_required: boolean;
};

export default function NewInteractionModal({
                                                customers,
                                                onSuccess,
                                            }: {
    customers: Customer[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            customer_id: '',
            type: 'call',
            title: '',
            notes: '',
            outcome: '',
            follow_up_required: false,
        },
        mode: 'onBlur',
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        
        try {
            const success = await createInteraction(values);
            
            if (success) {
                // Reset form
                form.reset({
                    customer_id: '',
                    type: 'call',
                    title: '',
                    notes: '',
                    outcome: '',
                    follow_up_required: false,
                });
                
                // Close modal
                setOpen(false);
                
                // Call success callback
                onSuccess?.();
            } else {
                form.setError('title', { message: 'Failed to log interaction' });
            }
        } catch (err) {
            console.error('Failed to log interaction:', err);
            form.setError('title', { message: 'Failed to log interaction' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when modal closes
    React.useEffect(() => {
        if (!open) {
            form.reset({
                customer_id: '',
                type: 'call',
                title: '',
                notes: '',
                outcome: '',
                follow_up_required: false,
            });
            setIsSubmitting(false);
        }
    }, [open, form]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline"
                    className="w-full sm:w-auto"
                >
                    + New Interaction
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Log New Interaction</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Select a customer and fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        {/* Customer */}
                        <FormField
                            control={form.control}
                            name="customer_id"
                            rules={{ required: "Customer is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Customer *</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                <SelectValue placeholder="Select a customer…" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                {customers.map((c) => (
                                                    <SelectItem 
                                                        key={c.id} 
                                                        value={c.id}
                                                        className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{c.full_name || 'Not Specified'}</span>
                                                            {c.business && (
                                                                <span className="text-xs text-slate-400">
                                                                    {c.business}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Type */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Type</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                <SelectValue placeholder="Select type…" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="call" className="text-slate-50 hover:bg-slate-800">Call</SelectItem>
                                                <SelectItem value="email" className="text-slate-50 hover:bg-slate-800">Email</SelectItem>
                                                <SelectItem value="meeting" className="text-slate-50 hover:bg-slate-800">Meeting</SelectItem>
                                                <SelectItem value="site visit" className="text-slate-50 hover:bg-slate-800">Site Visit</SelectItem>
                                                <SelectItem value="other" className="text-slate-50 hover:bg-slate-800">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            rules={{ required: "Title is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Title *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Conversation title…" 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Notes</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            {...field} 
                                            placeholder="Detailed notes…" 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Outcome */}
                        <FormField
                            control={form.control}
                            name="outcome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Outcome</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Result of the interaction…" 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Follow-up Required */}
                        <FormField
                            control={form.control}
                            name="follow_up_required"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value} 
                                            onCheckedChange={field.onChange}
                                            className="border-slate-600" 
                                        />
                                    </FormControl>
                                    <FormLabel className="text-slate-300">Follow-up required</FormLabel>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex justify-end space-x-2 pt-4">
                            <DialogClose asChild>
                                <Button variant="ghost" disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                variant="outline" 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Interaction'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}