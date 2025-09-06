'use client';

import * as React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import type {Customer} from '@/types/customer';
import {updateCustomer} from '@/app/lib/services/crmServices/customer/updateCustomer';
import {formatPhoneNumber} from '@/lib/phoneUtils';
import {Pencil} from 'lucide-react';

const customerFormSchema = z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.union([z.literal(''), z.string().email('Invalid email')]).optional(),
    phone: z.union([z.literal(''), z.string()]).optional(),
    business: z.union([z.literal(''), z.string()]).optional(),
    status: z.string(),
});

type FormValues = z.infer<typeof customerFormSchema>;

export default function UpdateCustomerModal({
                                                customer, onSuccess,
                                            }: {
    customer: Customer; onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            full_name: customer.full_name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            business: customer.business || '',
            status: customer.status || 'lead',
        }, mode: 'onBlur',
    });

    const {handleSubmit, control, setError} = form;

    const onSubmit = async (values: FormValues) => {
        const result = await updateCustomer({id: customer.id, ...values});
        if (result.success) {
            form.reset();
            setOpen(false);
            onSuccess?.();
        } else {
            setError('full_name', {message: result.error || 'Failed to update customer'});
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Pencil className="h-4 w-4"/>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit Customer</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Update the fields below.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                        {/* Full Name */}
                        <FormField
                            control={control}
                            name="full_name"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Full Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Jane Doe"
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />

                        {/* Email */}
                        <FormField
                            control={control}
                            name="email"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Email</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="email" 
                                            placeholder="jane@example.com"
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />

                        {/* Phone */}
                        <FormField
                            control={control}
                            name="phone"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Phone</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="tel" 
                                            placeholder="111-222-3333"
                                            maxLength={12}
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                            onChange={(e) => {
                                                const formatted = formatPhoneNumber(e.target.value);
                                                field.onChange(formatted);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />

                        {/* Business */}
                        <FormField
                            control={control}
                            name="business"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Business</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Acme Corp"
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />

                        {/* Status */}
                        <FormField
                            control={control}
                            name="status"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Status</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                <SelectValue placeholder="Select status…"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="lead" className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">Lead</SelectItem>
                                                <SelectItem value="prospect" className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">Prospect</SelectItem>
                                                <SelectItem value="contacted" className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">Contacted</SelectItem>
                                                <SelectItem value="qualified" className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">Qualified</SelectItem>
                                                <SelectItem value="proposal" className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">Proposal</SelectItem>
                                                <SelectItem value="closed" className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />

                        <DialogFooter className="flex justify-end space-x-2 pt-4">
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button 
                                variant="outline" 
                                type="submit"
                                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>);
}