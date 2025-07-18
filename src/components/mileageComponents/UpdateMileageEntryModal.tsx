import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MileageEntry } from '@/types/mileage';
import { Customer } from '@/types/customer';
import { updateMileageEntry } from '@/app/lib/services/mileageServices/updateMileageEntry';
import { Pencil } from 'lucide-react';

type FormValues = {
    date: string;
    start_location: string;
    end_location: string;
    purpose: string;
    miles: string;
    is_business: boolean;
    customer_id: string;
    notes: string;
};

export default function UpdateMileageEntryModal({
    mileageEntry, onSuccess,
}: {
    mileageEntry: MileageEntry;
    onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        // Fetch customers for the dropdown
        import('@/app/lib/services/crmServices/customer/getCustomers').then(({ getCustomers }) =>
            getCustomers().then(setCustomers)
        );
    }, []);

    const form = useForm<FormValues>({
        defaultValues: {
            date: mileageEntry.date,
            start_location: mileageEntry.start_location || '',
            end_location: mileageEntry.end_location || '',
            purpose: mileageEntry.purpose,
            miles: mileageEntry.miles.toString(),
            is_business: mileageEntry.is_business,
            customer_id: mileageEntry.customer_id || '',
            notes: mileageEntry.notes || '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        
        try {
            const success = await updateMileageEntry({
                id: mileageEntry.id,
                ...values,
                miles: parseFloat(values.miles),
                customer_id: values.customer_id || null,
                customer_name: customers.find((c) => c.id === values.customer_id)?.full_name || null,
            });

            if (success) {
                setOpen(false);
                onSuccess?.();
            } else {
                form.setError('purpose', { message: 'Failed to update mileage entry' });
            }
        } catch (error) {
            form.setError('purpose', { message: 'Failed to update mileage entry' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when modal closes
    React.useEffect(() => {
        if (!open) {
            setIsSubmitting(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit Mileage Entry</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Update the mileage entry details.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Date</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="date" 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Purpose */}
                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Purpose</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Client meeting, site visit, etc." 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Miles */}
                        <FormField
                            control={form.control}
                            name="miles"
                            rules={{
                                required: "Miles is required",
                                pattern: {
                                    value: /^[0-9]+\.?[0-9]*$/,
                                    message: "Please enter a valid number"
                                },
                                min: {
                                    value: 0.1,
                                    message: "Miles must be greater than 0"
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Miles</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            placeholder="0.0"
                                            className="bg-slate-900 border-slate-700 text-slate-50 font-mono font-semibold"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Enter mileage (e.g., 15 or 15.5)
                                    </p>
                                </FormItem>
                            )}
                        />

                        {/* Business Trip Checkbox */}
                        <FormField
                            control={form.control}
                            name="is_business"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value} 
                                            onCheckedChange={field.onChange}
                                            className="border-slate-600"
                                        />
                                    </FormControl>
                                    <FormLabel className="text-slate-300">Business trip (eligible for tax deduction at $0.67/mile)</FormLabel>
                                </FormItem>
                            )}
                        />

                        {/* Start Location */}
                        <FormField
                            control={form.control}
                            name="start_location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">From (Optional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Starting location" 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* End Location */}
                        <FormField
                            control={form.control}
                            name="end_location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">To (Optional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Destination" 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Customer */}
                        <FormField
                            control={form.control}
                            name="customer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Customer (Optional)</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                                                <SelectValue placeholder="Select customer..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                {customers.map((c) => (
                                                    <SelectItem 
                                                        key={c.id} 
                                                        value={c.id}
                                                        className="text-slate-50 hover:bg-slate-800 focus:bg-slate-800"
                                                    >
                                                        {c.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            {...field} 
                                            placeholder="Additional details..." 
                                            className="bg-slate-900 border-slate-700 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex justify-end space-x-2 pt-4">
                            <DialogClose asChild>
                                <Button variant="ghost" disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                variant="outline" 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {isSubmitting ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}