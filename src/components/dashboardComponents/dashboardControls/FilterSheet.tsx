"use client";

import {useRouter, useSearchParams} from 'next/navigation';
import {
    Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {Filter} from 'lucide-react';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {toast} from 'sonner';

const filterSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    type: z.enum(['all', 'call', 'email', 'meeting', 'text', 'other']).optional(),
});
type FilterValues = z.infer<typeof filterSchema>;

export function FilterSheet() {
    const router = useRouter();
    const params = useSearchParams();

    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema), defaultValues: {
            startDate: params.get('startDate') ?? '',
            endDate: params.get('endDate') ?? '',
            type: (params.get('type') as FilterValues['type']) ?? 'all',
        },
    });

    const onSubmit = (vals: FilterValues) => {
        const q = new URLSearchParams();
        if (vals.startDate) q.set('startDate', vals.startDate);
        if (vals.endDate) q.set('endDate', vals.endDate);
        if (vals.type && vals.type !== 'all') q.set('type', vals.type);
        router.push(`?${q.toString()}`);
        toast.success('Filter applied');
    };

    return (<Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800/50 text-slate-300">
                    <Filter className="w-4 h-4 mr-2"/> Filter
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
                <SheetHeader><SheetTitle>Filter Dashboard</SheetTitle></SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({field}) => (<FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({field}) => (<FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({field}) => (<FormItem>
                                    <FormLabel>Interaction Type</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="call">Call</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="meeting">Meeting</SelectItem>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>)}
                        />

                        <SheetFooter className="flex justify-end space-x-2">
                            <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                            <Button type="submit" variant="secondary">Apply</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>);
}
