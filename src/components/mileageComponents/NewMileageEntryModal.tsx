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
    customers, onSuccess,
}: {
    customers: Customer[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
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
        
        try {
            const success = await createMileageEntry({
                ...values,
                miles: parseFloat(values.miles),
                customer_id: values.customer_id || null,
                customer_name: customers.find((c) => c.id === values.customer_id)?.full_name || null,
            });

            if (success) {
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
                setOpen(false);
                onSuccess?.();
            } else {
                form.setError('miles', { message: 'Failed to create mileage entry' });
            }
        } catch (error) {
            form.setError('miles', { message: 'Failed to create mileage entry' });
        } finally {
            setIsSubmitting(false);
        }
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-emerald-600 text-white hover:bg-emerald-700">
                    + Add Mileage
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Add Mileage Entry</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Track your business and personal mileage with exact decimal precision for tax purposes.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* Date */}
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

                        {/* Purpose */}
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

                        {/* Miles - Primary Required Field with Smart Decimal Precision */}
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

                        {/* Business Trip Checkbox */}
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

                        {/* Optional Fields Section */}
                        <div className="border-t border-slate-600 pt-6 space-y-6">
                            <h4 className="text-sm font-medium text-slate-300 mb-4">Optional Details</h4>
                            
                            {/* Start Location */}
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

                            {/* End Location */}
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

                            {/* Customer */}
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

                            {/* Notes */}
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
                                variant="outline" 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
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