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
import {createCustomer} from '@/app/lib/services/crmServices/customer/createCustomer';
import {formatPhoneNumber} from '@/lib/phoneUtils';

type FormValues = {
    full_name: string;
    email: string;
    phone: string;
    business: string;
    status: 'lead' | 'prospect' | 'contacted' | 'qualified' | 'proposal' | 'closed';
};

export default function NewCustomerModal({onSuccess}: { onSuccess?: () => void }) {
    const [open, setOpen] = React.useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            full_name: '', email: '', phone: '', business: '', status: 'lead',
        }, mode: 'onBlur',
    });

    const onSubmit = async (values: FormValues) => {
        const ok = await createCustomer(values);
        if (ok) {
            form.reset();
            setOpen(false);
            onSuccess?.();
        } else {
            form.setError('full_name', {message: 'Failed to create customer'});
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className="w-full sm:w-auto bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-200"
                >
                    + New Customer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-slate-900 border-slate-700 rounded-xl shadow-2xl">
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
                                        <Input 
                                            {...field} 
                                            placeholder="Jane Doe"
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
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
                        <FormField
                            control={form.control}
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
                        <FormField
                            control={form.control}
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
                        <FormField
                            control={form.control}
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
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>);
}