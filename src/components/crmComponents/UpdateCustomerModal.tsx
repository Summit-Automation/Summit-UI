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
import type {Customer} from '@/types/customer';
import {updateCustomer} from '@/app/lib/services/crmServices/customer/updateCustomer';
import {Pencil} from 'lucide-react';

type FormValues = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

export default function UpdateCustomerModal({
                                                customer, onSuccess,
                                            }: {
    customer: Customer; onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const form = useForm<FormValues>({
        defaultValues: {
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone,
            business: customer.business,
            status: customer.status,
        }, mode: 'onBlur',
    });

    const {handleSubmit, control, setError} = form;

    const onSubmit = async (values: FormValues) => {
        const ok = await updateCustomer({id: customer.id, ...values});
        if (ok) {
            form.reset();
            setOpen(false);
            onSuccess?.();
        } else {
            setError('full_name', {message: 'Failed to update customer'});
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Pencil className="h-4 w-4"/>
                </Button>
            </DialogTrigger>

            <DialogContent
                className="max-w-lg bg-primary/90 backdrop-blur-lg border border-border rounded-xl shadow-premium">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit Customer</DialogTitle>
                    <DialogDescription className="text-slate-300">
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
                                        <Input {...field} placeholder="Jane Doe"/>
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
                                        <Input {...field} type="email" placeholder="jane@example.com"/>
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
                                        <Input {...field} type="tel" placeholder="+1 (555) 123-4567"/>
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
                                        <Input {...field} placeholder="Acme Corp"/>
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
                            <Button variant="outline" type="submit">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>);
}
