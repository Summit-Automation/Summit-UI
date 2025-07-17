'use client';

import * as React from 'react';
import {useForm} from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {createTransaction} from '@/app/lib/services/bookkeeperServices/createTransaction';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';

type FormValues = {
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: string;
    customer_id: string;
    interaction_id: string;
};

export default function NewTransactionModal({
                                                customers, interactions, onSuccess,
                                            }: {
    customers: Customer[]; interactions: Interaction[]; onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            type: 'expense', category: '', description: '', amount: '', customer_id: '', interaction_id: '',
        }, mode: 'onBlur',
    });

    // filter interactions when a customer is selected
    const selectedCustomer = form.watch('customer_id');
    const customerInteractions = interactions.filter((i) => i.customer_id === selectedCustomer);

    const onSubmit = async (values: FormValues) => {
        const success = await createTransaction({
            ...values,
            amount: values.amount.toString(),
            customer_id: values.customer_id || null,
            interaction_id: values.interaction_id || null,
            customer_name: customers.find((c) => c.id === values.customer_id)?.full_name || null,
            interaction_title: interactions.find((i) => i.id === values.interaction_id)?.title || null,
            interaction_outcome: interactions.find((i) => i.id === values.interaction_id)?.outcome || null,
        });

        if (success) {
            form.reset();
            setOpen(false);
            onSuccess?.();
        } else {
            form.setError('category', {message: 'Failed to create transaction'});
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline">+ Add Transaction</Button>
        </DialogTrigger>
        <DialogContent
            className="max-w-xl bg-primary/90 backdrop-blur-lg border border-border rounded-xl shadow-premium">
            <DialogHeader>
                <DialogTitle className="text-white">Add New Transaction</DialogTitle>
                <DialogDescription className="text-slate-300">
                    Fill out the details below.
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                    {/* Type */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Type</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type…"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Category */}
                    <FormField
                        control={form.control}
                        name="category"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Category</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. Consulting"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Details…"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Amount */}
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Amount</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Customer */}
                    <FormField
                        control={form.control}
                        name="customer_id"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Customer</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Optional…"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((c) => (<SelectItem key={c.id} value={c.id}>
                                            {c.full_name}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Interaction */}
                    <FormField
                        control={form.control}
                        name="interaction_id"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Interaction</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!selectedCustomer}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Optional…"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customerInteractions.map((i) => (<SelectItem key={i.id} value={i.id}>
                                            {i.title}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Footer */}
                    <DialogFooter className="flex justify-end space-x-2 pt-4">
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button variant="outline" type="submit">Save Transaction</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>);
}
