"use client";

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';
import {Form, FormControl, FormField, FormItem, FormLabel} from '@/components/ui/form';
import {Checkbox} from '@/components/ui/checkbox';
import {toast} from 'sonner';
import type { Customer } from '@/types/customer';
import type { Interaction } from '@/types/interaction';
import type { Transaction } from '@/types/transaction';

const exportSchema = z.object({
    exportCustomers: z.boolean(), 
    exportInteractions: z.boolean(), 
    exportTransactions: z.boolean(),
});
type ExportValues = z.infer<typeof exportSchema>;

interface ExportDialogProps {
    customers: Customer[];
    interactions: Interaction[];
    transactions: Transaction[];
}

export function ExportDialog({customers, interactions, transactions}: ExportDialogProps) {
    const form = useForm<ExportValues>({
        resolver: zodResolver(exportSchema), 
        defaultValues: {
            exportCustomers: true, 
            exportInteractions: true, 
            exportTransactions: true,
        },
    });

    const onSubmit = (vals: ExportValues) => {
        const out: Record<string, Customer[] | Interaction[] | Transaction[]> = {};
        if (vals.exportCustomers) out.customers = customers;
        if (vals.exportInteractions) out.interactions = interactions;
        if (vals.exportTransactions) out.transactions = transactions;

        const blob = new Blob([JSON.stringify(out, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard-export.json';
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Export completed');
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-slate-900 border-slate-700 text-slate-50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
                >
                    <Download className="w-4 h-4 mr-2"/> Export
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Export Data</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {(['Customers', 'Interactions', 'Transactions'] as const).map((label) => (
                            <FormField
                                key={label}
                                control={form.control}
                                name={`export${label}` as const}
                                render={({field}) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange}
                                                className="border-slate-600"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-slate-300">{label}</FormLabel>
                                    </FormItem>
                                )}
                            />
                        ))}

                        <DialogFooter className="flex justify-end space-x-2">
                            <DialogClose asChild>
                                <Button 
                                    variant="outline"
                                    className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                type="submit"
                                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                            >
                                Export
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}