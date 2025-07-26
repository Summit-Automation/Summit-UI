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
import {createRecurringPayment} from '@/app/lib/services/bookkeeperServices/createRecurringPayment';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import {RecurringFrequency} from '@/types/recurringPayment';
import {Checkbox} from '@/components/ui/checkbox';

type FormValues = {
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: string;
    customer_id: string;
    interaction_id: string;
    is_recurring: boolean;
    frequency: RecurringFrequency;
    start_date: string;
    end_date: string;
    day_of_month: number;
    day_of_week: number;
    payment_limit: number;
};

export default function NewTransactionModal({
                                                customers, interactions, onSuccess, triggerContent, triggerClassName,
                                            }: {
    customers: Customer[]; interactions: Interaction[]; onSuccess?: () => void; triggerContent?: React.ReactNode; triggerClassName?: string;
}) {
    const [open, setOpen] = React.useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            type: 'expense', 
            category: '', 
            description: '', 
            amount: '', 
            customer_id: '', 
            interaction_id: '',
            is_recurring: false,
            frequency: 'monthly',
            start_date: '',
            end_date: '',
            day_of_month: 1,
            day_of_week: 0,
            payment_limit: 0,
        }, mode: 'onBlur',
    });

    // filter interactions when a customer is selected
    const selectedCustomer = form.watch('customer_id');
    const customerInteractions = interactions.filter((i) => i.customer_id === selectedCustomer);
    
    // watch recurring checkbox and frequency
    const isRecurring = form.watch('is_recurring');
    const frequency = form.watch('frequency');

    const onSubmit = async (values: FormValues) => {
        if (values.is_recurring) {
            // Create recurring payment
            const recurringData = {
                type: values.type,
                category: values.category,
                description: values.description,
                amount: values.amount.toString(),
                frequency: values.frequency,
                start_date: values.start_date || new Date().toISOString(),
                end_date: values.end_date || null,
                day_of_month: frequency === 'monthly' || frequency === 'quarterly' || frequency === 'yearly' ? 
                    values.day_of_month : null,
                day_of_week: frequency === 'weekly' ? values.day_of_week : null,
                customer_id: values.customer_id || null,
                interaction_id: values.interaction_id || null,
                payment_limit: values.payment_limit > 0 ? values.payment_limit : null,
            };

            const result = await createRecurringPayment(recurringData);
            
            if (result.success) {
                form.reset();
                setOpen(false);
                onSuccess?.();
            } else {
                form.setError('category', {message: result.error || 'Failed to create recurring payment'});
            }
        } else {
            // Create one-time transaction
            const success = await createTransaction({
                type: values.type,
                category: values.category,
                description: values.description,
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
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {triggerContent || (
                <Button 
                    variant="outline"
                    className={triggerClassName || "w-full sm:w-auto bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-200"}
                >
                    + Add Transaction
                </Button>
            )}
        </DialogTrigger>
        <DialogContent className="max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
            <DialogHeader>
                <DialogTitle className="text-white">Add New Transaction</DialogTitle>
                <DialogDescription className="text-slate-300">
                    Fill out the details below.
                </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[60vh] pr-2">
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
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                        <SelectValue placeholder="Select type…"/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        <SelectItem value="income" className="text-slate-50 hover:bg-slate-800">Income</SelectItem>
                                        <SelectItem value="expense" className="text-slate-50 hover:bg-slate-800">Expense</SelectItem>
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
                                <Input 
                                    {...field} 
                                    placeholder="e.g. Consulting"
                                    className="bg-slate-900 border-slate-700 text-slate-50"
                                />
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
                                <Textarea 
                                    {...field} 
                                    placeholder="Details…"
                                    className="bg-slate-900 border-slate-700 text-slate-50"
                                />
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
                                    className="bg-slate-900 border-slate-700 text-slate-50"
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
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                        <SelectValue placeholder="Optional…"/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {customers.map((c) => (<SelectItem 
                                            key={c.id} 
                                            value={c.id}
                                            className="text-slate-50 hover:bg-slate-800"
                                        >
                                            {c.full_name || 'Not Specified'}
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
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                        <SelectValue placeholder="Optional…"/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {customerInteractions.map((i) => (<SelectItem 
                                            key={i.id} 
                                            value={i.id}
                                            className="text-slate-50 hover:bg-slate-800"
                                        >
                                            {i.title}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Recurring Payment Checkbox */}
                    <FormField
                        control={form.control}
                        name="is_recurring"
                        render={({field}) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-slate-300">
                                    Make this a recurring payment
                                </FormLabel>
                            </div>
                        </FormItem>)}
                    />

                    {/* Recurring Payment Fields */}
                    {isRecurring && (
                        <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                            <h4 className="text-sm font-medium text-slate-300">Recurring Payment Settings</h4>
                            
                            {/* Frequency */}
                            <FormField
                                control={form.control}
                                name="frequency"
                                render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Frequency</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                <SelectValue placeholder="Select frequency…"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="daily" className="text-slate-50 hover:bg-slate-800">Daily</SelectItem>
                                                <SelectItem value="weekly" className="text-slate-50 hover:bg-slate-800">Weekly</SelectItem>
                                                <SelectItem value="monthly" className="text-slate-50 hover:bg-slate-800">Monthly</SelectItem>
                                                <SelectItem value="quarterly" className="text-slate-50 hover:bg-slate-800">Quarterly</SelectItem>
                                                <SelectItem value="yearly" className="text-slate-50 hover:bg-slate-800">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                            />

                            {/* Start Date */}
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Start Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="date"
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                            />

                            {/* Day of Month (for monthly/quarterly/yearly) */}
                            {(frequency === 'monthly' || frequency === 'quarterly' || frequency === 'yearly') && (
                                <FormField
                                    control={form.control}
                                    name="day_of_month"
                                    render={({field}) => (<FormItem>
                                        <FormLabel className="text-slate-300">Day of Month</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                placeholder="1-31"
                                                className="bg-slate-900 border-slate-700 text-slate-50"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>)}
                                />
                            )}

                            {/* Day of Week (for weekly) */}
                            {frequency === 'weekly' && (
                                <FormField
                                    control={form.control}
                                    name="day_of_week"
                                    render={({field}) => (<FormItem>
                                        <FormLabel className="text-slate-300">Day of Week</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                    <SelectValue placeholder="Select day…"/>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-700">
                                                    <SelectItem value="0" className="text-slate-50 hover:bg-slate-800">Sunday</SelectItem>
                                                    <SelectItem value="1" className="text-slate-50 hover:bg-slate-800">Monday</SelectItem>
                                                    <SelectItem value="2" className="text-slate-50 hover:bg-slate-800">Tuesday</SelectItem>
                                                    <SelectItem value="3" className="text-slate-50 hover:bg-slate-800">Wednesday</SelectItem>
                                                    <SelectItem value="4" className="text-slate-50 hover:bg-slate-800">Thursday</SelectItem>
                                                    <SelectItem value="5" className="text-slate-50 hover:bg-slate-800">Friday</SelectItem>
                                                    <SelectItem value="6" className="text-slate-50 hover:bg-slate-800">Saturday</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>)}
                                />
                            )}

                            {/* End Date (Optional) */}
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">End Date (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="date"
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                            />

                            {/* Payment Limit (Optional) */}
                            <FormField
                                control={form.control}
                                name="payment_limit"
                                render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Payment Limit (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            min="0"
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="0 = unlimited"
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                            />
                        </div>
                    )}
                    </form>
                </Form>
            </div>

            {/* Footer - Outside of scrollable area */}
            <DialogFooter className="flex justify-end space-x-2 pt-4 border-t border-slate-700 mt-4">
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button 
                    variant="outline" 
                    type="submit"
                    onClick={form.handleSubmit(onSubmit)}
                    className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                >
                    Save Transaction
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}