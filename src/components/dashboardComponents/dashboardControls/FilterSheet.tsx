"use client";

import { Suspense } from 'react';
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

function FilterSheetContent() {
    const router = useRouter();
    const params = useSearchParams();

    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema), 
        defaultValues: {
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

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-slate-900 border-slate-700 text-slate-50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
                >
                    <Filter className="w-4 h-4 mr-2"/> Filter
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-slate-900 border-slate-700">
                <SheetHeader>
                    <SheetTitle className="text-white">Filter Dashboard</SheetTitle>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Start Date</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date" 
                                            {...field} 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">End Date</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date" 
                                            {...field} 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Interaction Type</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                <SelectValue placeholder="Select type"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="all" className="text-slate-50 hover:bg-slate-800">All</SelectItem>
                                                <SelectItem value="call" className="text-slate-50 hover:bg-slate-800">Call</SelectItem>
                                                <SelectItem value="email" className="text-slate-50 hover:bg-slate-800">Email</SelectItem>
                                                <SelectItem value="meeting" className="text-slate-50 hover:bg-slate-800">Meeting</SelectItem>
                                                <SelectItem value="text" className="text-slate-50 hover:bg-slate-800">Text</SelectItem>
                                                <SelectItem value="other" className="text-slate-50 hover:bg-slate-800">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <SheetFooter className="flex justify-end space-x-2">
                            <SheetClose asChild>
                                <Button variant="outline" className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                    Cancel
                                </Button>
                            </SheetClose>
                            <Button 
                                type="submit" 
                                variant="secondary"
                                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                            >
                                Apply
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}

export function FilterSheet() {
    return (
        <Suspense fallback={
            <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-900 border-slate-700 text-slate-50" 
                disabled
            >
                <Filter className="w-4 h-4 mr-2"/> Filter
            </Button>
        }>
            <FilterSheetContent />
        </Suspense>
    );
}