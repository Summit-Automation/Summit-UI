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
import { createInteraction } from '@/app/lib/services/crmServices/createInteraction';
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
        const ok = await createInteraction(values);
        if (ok) {
            form.reset();
            onSuccess?.();
        } else {
            form.setError('title', { message: 'Failed to log interaction' });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {/* same accent button as New Customer */}
                <Button variant="outline" className="bg-accent text-accent-fg hover:bg-accent/90">
                    + New Interaction
                </Button>
            </DialogTrigger>

            {/* same primary modal background as New Customer */}
            <DialogContent className="max-w-xl bg-primary/90 backdrop-blur-lg border border-border rounded-xl shadow-premium">
                <DialogHeader>
                    <DialogTitle className="text-white">Log New Interaction</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        Select a customer and fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        {/* Customer */}
                        <FormField
                            control={form.control}
                            name="customer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Customer</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a customer…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.full_name}
                                                        {c.business ? ` – ${c.business}` : ''}
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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="call">Call</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="meeting">Meeting</SelectItem>
                                                <SelectItem value="site visit">Site Visit</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
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
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Conversation title…" />
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
                                        <Textarea {...field} placeholder="Detailed notes…" />
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
                                        <Input {...field} placeholder="Result of the interaction…" />
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
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="text-slate-300">Follow-up required</FormLabel>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex justify-end space-x-2 pt-4">
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button variant="outline" type="submit">
                                Save Interaction
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
