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
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-emerald-600 text-white hover:bg-emerald-700">
                    + Add Mileage
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-primary/90 backdrop-blur-lg border border-border rounded-xl shadow-premium">
                <DialogHeader>
                    <DialogTitle className="text-white">Add Mileage Entry</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        Track your business and personal mileage. Only miles driven is required for tax purposes.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            rules={{ required: "Date is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Date *</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date" />
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
                                <FormItem>
                                    <FormLabel className="text-slate-300">Purpose *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Client meeting, site visit, etc." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Miles - Primary Required Field */}
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
                                <FormItem>
                                    <FormLabel className="text-slate-300">Miles Driven *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            className="font-semibold"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Business Trip Checkbox */}
                        <FormField
                            control={form.control}
                            name="is_business"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="text-slate-300">Business trip (eligible for tax deduction)</FormLabel>
                                </FormItem>
                            )}
                        />

                        {/* Optional Fields Section */}
                        <div className="border-t border-slate-600 pt-4">
                            <h4 className="text-sm font-medium text-slate-300 mb-3">Optional Details (for AI integration)</h4>
                            
                            {/* Start Location */}
                            <FormField
                                control={form.control}
                                name="start_location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">From (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Starting location" />
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
                                    <FormItem>
                                        <FormLabel className="text-slate-300">To (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Destination" />
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
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Customer (Optional)</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select customer..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
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
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Additional details..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="flex justify-end space-x-2 pt-4">
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button variant="outline" type="submit">Save Entry</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}