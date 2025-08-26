'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createMileageEntry } from '@/app/lib/services/mileageServices/createMileageEntry';
import { Customer } from '@/types/customer';

type FormValues = {
    date: string;
    start_location: string;
    end_location: string;
    purpose: string;
    miles: string;
    is_business: boolean;
    customer_id: string;
    notes: string;
};

export default function NewMileageEntryModal({
    customers, onSuccess, triggerContent, triggerClassName, open, onOpenChange,
}: {
    customers: Customer[];
    onSuccess?: () => void;
    triggerContent?: React.ReactNode;
    triggerClassName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            date: new Date().toISOString().split('T')[0], // Today's date
            start_location: '',
            end_location: '',
            purpose: '',
            miles: '',
            is_business: true,
            customer_id: '',
            notes: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        
        const result = await createMileageEntry({
            ...values,
            miles: parseFloat(values.miles),
            customer_id: values.customer_id || null,
            customer_name: customers.find((c) => c.id === values.customer_id)?.full_name || null,
        });

        if (result.success) {
            form.reset({
                date: new Date().toISOString().split('T')[0],
                start_location: '',
                end_location: '',
                purpose: '',
                miles: '',
                is_business: true,
                customer_id: '',
                notes: '',
            });
            setIsOpen(false);
            onSuccess?.();
        } else {
            console.error('Failed to create mileage entry:', result.error);
            form.setError('miles', { message: result.error || 'Failed to create mileage entry' });
        }
        
        setIsSubmitting(false);
    };

    // Reset form when modal closes
    React.useEffect(() => {
        if (!open) {
            form.reset({
                date: new Date().toISOString().split('T')[0],
                start_location: '',
                end_location: '',
                purpose: '',
                miles: '',
                is_business: true,
                customer_id: '',
                notes: '',
            });
            setIsSubmitting(false);
        }
    }, [open, form]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {open === undefined && (
                <DialogTrigger asChild>
                    {triggerContent || (
                        <Button variant="success" className={triggerClassName}>
                            + Add Mileage
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Add Mileage Entry</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Track your business and personal mileage with exact decimal precision for tax purposes.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* Form fields remain the same as original */}
                        <FormField
                            control={form.control}
                            name="date"
                            rules={{ required: "Date is required" }}
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-slate-300">Date *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="date" 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purpose"
                            rules={{ required: "Purpose is required" }}
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-slate-300">Purpose *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Client meeting, site visit, etc." 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="miles"
                            rules={{ 
                                required: "Miles is required",
                                pattern: {
                                    value: /^[0-9]+\.?[0-9]*$/,
                                    message: "Please enter a valid number"
                                },
                                min: {
                                    value: 0.1,
                                    message: "Miles must be greater than 0"
                                }
                            }}
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-slate-300">Miles Driven *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            placeholder="0.0"
                                            className="font-mono font-semibold bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Enter mileage (e.g., 15 or 15.5)
                                    </p>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_business"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange}
                                                className="border-slate-600"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-slate-300">Business trip (eligible for tax deduction at $0.67/mile)</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="border-t border-slate-600 pt-6 space-y-6">
                            <h4 className="text-sm font-medium text-slate-300 mb-4">Optional Details</h4>
                            
                            <FormField
                                control={form.control}
                                name="start_location"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-slate-300">From (Optional)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Starting location" 
                                                className="bg-slate-900 border-slate-700 text-slate-50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_location"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-slate-300">To (Optional)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Destination" 
                                                className="bg-slate-900 border-slate-700 text-slate-50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-slate-300">Customer (Optional)</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                    <SelectValue placeholder="Select customer..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-700">
                                                    {customers.map((c) => (
                                                        <SelectItem 
                                                            key={c.id} 
                                                            value={c.id}
                                                            className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800"
                                                        >
                                                            {c.full_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-slate-300">Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field} 
                                                placeholder="Additional details..." 
                                                className="bg-slate-900 border-slate-700 text-slate-50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="flex justify-end space-x-2 pt-6">
                            <DialogClose asChild>
                                <Button variant="ghost" disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                variant="success" 
                                type="submit" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Entry'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}