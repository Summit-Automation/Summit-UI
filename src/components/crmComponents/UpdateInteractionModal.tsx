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
import {Checkbox} from '@/components/ui/checkbox';
import type {Interaction} from '@/types/interaction';
import type {Customer} from '@/types/customer';
import {updateInteraction} from '@/app/lib/services/crmServices/interaction/updateInteraction';
import {Pencil} from 'lucide-react';

/**
 * Edit Interaction Modal with lazy-loaded customer list.
 */

type UpdateInteractionInput = {
    id: string;
    customer_id: string;
    type: 'call' | 'email' | 'meeting' | 'site visit' | 'other';
    title: string;
    notes: string;
    outcome: string;
    follow_up_required: boolean;
}

type FormValues = Omit<UpdateInteractionInput, 'id'> & { customer_id: string; };

export default function UpdateInteractionModal({
                                                   customers, interaction, onSuccess,
                                               }: {
    interaction: Interaction; customers: Customer[]; onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);


    const form = useForm<FormValues>({
        defaultValues: {
            customer_id: interaction.customer_id,
            type: interaction.type,
            title: interaction.title,
            notes: interaction.notes,
            outcome: interaction.outcome,
            follow_up_required: interaction.follow_up_required,
        }, mode: 'onBlur',
    });

    const {handleSubmit, control, setError} = form;

    const onSubmit = async (values: FormValues) => {
        const ok = await updateInteraction({
            id: interaction.id,
            customer_id: values.customer_id,
            type: values.type,
            title: values.title,
            notes: values.notes,
            outcome: values.outcome,
            follow_up_required: values.follow_up_required,
        });
        if (ok) {
            setOpen(false);
            onSuccess?.();
        } else {
            setError('title', {message: 'Failed to update interaction'});
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <Pencil className="h-4 w-4"/>
            </Button>
        </DialogTrigger>

        <DialogContent
            className="max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
            <DialogHeader>
                <DialogTitle className="text-white">Edit Interaction</DialogTitle>
                <DialogDescription className="text-slate-300">
                    Modify the interaction details below.
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    {/* Customer */}
                    <FormField
                        control={control}
                        name="customer_id"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Customer</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                        <SelectValue placeholder="Select a customer…"/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {customers.map((c) => (<SelectItem key={c.id} value={c.id} className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">
                                            {c.full_name || 'Not Specified'}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Type & Title */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="type"
                            render={({field}) => (<FormItem>
                                <FormLabel className="text-slate-300">Type</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                            <SelectValue placeholder="Select type…"/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700">
                                            {['call', 'email', 'meeting', 'site visit', 'other'].map((t) => (
                                                <SelectItem key={t} value={t} className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800">
                                                    {t}
                                                </SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>)}
                        />
                        <FormField
                            control={control}
                            name="title"
                            render={({field}) => (<FormItem>
                                <FormLabel className="text-slate-300">Title</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Interaction title…" className="bg-slate-900 border-slate-700 text-slate-50"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>)}
                        />
                    </div>

                    {/* Notes & Outcome */}
                    <FormField
                        control={control}
                        name="notes"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Notes</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Detailed notes…" className="bg-slate-900 border-slate-700 text-slate-50"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />
                    <FormField
                        control={control}
                        name="outcome"
                        render={({field}) => (<FormItem>
                            <FormLabel className="text-slate-300">Outcome</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Result of the interaction…" className="bg-slate-900 border-slate-700 text-slate-50"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />

                    {/* Follow-up */}
                    <FormField
                        control={control}
                        name="follow_up_required"
                        render={({field}) => (<FormItem className="flex items-center space-x-2">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-slate-600"/>
                            </FormControl>
                            <FormLabel className="text-slate-300">Follow-up required</FormLabel>
                        </FormItem>)}
                    />

                    <DialogFooter className="flex justify-end space-x-2 pt-4">
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button variant="outline" type="submit" className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>);
}
