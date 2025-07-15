'use client';

import * as React from 'react';
import {useForm} from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {createCustomer} from '@/app/lib/services/crmServices/createCustomer';

type FormValues = {
    full_name: string;
    email: string;
    phone: string;
    business: string;
    status: 'lead' | 'prospect' | 'contacted' | 'qualified' | 'proposal' | 'closed';
};

export default function NewCustomerModal({onSuccess}: { onSuccess?: () => void }) {
    const form = useForm<FormValues>({
        defaultValues: {
            full_name: '', email: '', phone: '', business: '', status: 'lead',
        }, mode: 'onBlur',
    });

    const onSubmit = async (values: FormValues) => {
        const ok = await createCustomer(values);
        if (ok) {
            form.reset();
            onSuccess?.();
        } else {
            form.setError('full_name', {message: 'Failed to create customer'});
        }
    };

    return (<Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-emerald-600 text-white hover:bg-emerald-700">
                    + New Customer
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-w-lg bg-primary/90 backdrop-blur-lg border border-border rounded-xl shadow-premium">
                <DialogHeader>
                    <DialogTitle className="text-white">Add New Customer</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        Fill out the details to create a new customer record.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Jane Doe"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="jane@example.com"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Phone</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="tel" placeholder="+1 (555) 123-4567"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />
                        <FormField
                            control={form.control}
                            name="business"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Business</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Acme Corp"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({field}) => (<FormItem>
                                    <FormLabel className="text-slate-300">Status</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status…"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lead">Lead</SelectItem>
                                                <SelectItem value="prospect">Prospect</SelectItem>
                                                <SelectItem value="contacted">Contacted</SelectItem>
                                                <SelectItem value="qualified">Qualified</SelectItem>
                                                <SelectItem value="proposal">Proposal</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
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
                            <Button variant="outline" type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>);
}
