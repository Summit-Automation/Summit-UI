'use client';

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
import { Badge } from '@/components/ui/badge';
import { createMileageEntry } from '@/app/lib/services/mileageServices/createMileageEntry';
import { calculateMileage as calculateMileageSecure } from '@/app/lib/services/mileageServices/calculateMileage';
import { Customer } from '@/types/customer';
import { Navigation, Brain, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

type FormValues = {
    date: string;
    start_location: string;
    end_location: string;
    purpose: string;
    is_business: boolean;
    customer_id: string;
    notes: string;
};

type AIResponse = {
    miles: number;
    duration: string;
    route: string;
    success: boolean;
    error?: string;
};

export default function AIMileageTrackerModal({
    customers, onSuccess,
}: {
    customers: Customer[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [isCalculating, setIsCalculating] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [aiResponse, setAiResponse] = React.useState<AIResponse | null>(null);

    const form = useForm<FormValues>({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            start_location: '',
            end_location: '',
            purpose: '',
            is_business: true,
            customer_id: '',
            notes: '',
        },
        mode: 'onBlur',
    });

    const calculateMileage = async (startLocation: string, endLocation: string) => {
        setIsCalculating(true);
        setAiResponse(null);

        try {
            // SECURITY: Call secure server action instead of client-side Flowise API
            const response = await calculateMileageSecure({
                start_location: startLocation,
                end_location: endLocation,
                trip_purpose: '' // Optional field
            });

            if (!response.success) {
                throw new Error(response.message);
            }

            if (!response.data) {
                throw new Error('No mileage data received');
            }

            // Convert server response to component format
            const parsedResponse: AIResponse = {
                miles: response.data.miles,
                duration: response.data.duration,
                route: response.data.route,
                success: response.data.success,
            };

            console.log('Parsed AI Response:', parsedResponse);
            setAiResponse(parsedResponse);
        } catch (err) {
            console.error('Error calculating mileage:', err);
            setAiResponse({
                miles: 0,
                duration: '',
                route: '',
                success: false,
                error: err instanceof Error ? err.message : 'Failed to calculate mileage',
            });
        } finally {
            setIsCalculating(false);
        }
    };

    const onSubmit = async (values: FormValues) => {
        if (!aiResponse?.success || !aiResponse.miles) {
            form.setError('end_location', { message: 'Please calculate mileage first' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const success = await createMileageEntry({
                ...values,
                miles: aiResponse.miles,
                customer_id: values.customer_id || null,
                customer_name: customers.find((c) => c.id === values.customer_id)?.full_name || null,
                notes: values.notes + (values.notes ? '\n\n' : '') + `AI Calculated Route: ${aiResponse.route}`,
            });

            if (success) {
                form.reset({
                    date: new Date().toISOString().split('T')[0],
                    start_location: '',
                    end_location: '',
                    purpose: '',
                    is_business: true,
                    customer_id: '',
                    notes: '',
                });
                setAiResponse(null);
                setOpen(false);
                onSuccess?.();
            } else {
                form.setError('purpose', { message: 'Failed to create mileage entry' });
            }
        } catch (err) {
            console.error('Failed to create mileage entry:', err);
            form.setError('purpose', { message: 'Failed to create mileage entry' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCalculate = () => {
        const startLocation = form.getValues('start_location');
        const endLocation = form.getValues('end_location');
        
        if (!startLocation || !endLocation) {
            if (!startLocation) form.setError('start_location', { message: 'Start location is required' });
            if (!endLocation) form.setError('end_location', { message: 'End location is required' });
            return;
        }

        calculateMileage(startLocation, endLocation);
    };

    // Reset form when modal closes
    React.useEffect(() => {
        if (!open) {
            form.reset({
                date: new Date().toISOString().split('T')[0],
                start_location: '',
                end_location: '',
                purpose: '',
                is_business: true,
                customer_id: '',
                notes: '',
            });
            setAiResponse(null);
            setIsCalculating(false);
            setIsSubmitting(false);
        }
    }, [open, form]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                >
                    <Brain className="h-4 w-4 mr-2" />
                    AI Mileage Tracker
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-blue-400" />
                        AI-Powered Mileage Calculator
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enter your start and end locations, and our AI will calculate the exact mileage using Google Maps.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            rules={{ required: "Date is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Date *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="date" 
                                            className="bg-slate-800 border-slate-600 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Locations Section */}
                        <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">Route Information</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Start Location */}
                                <FormField
                                    control={form.control}
                                    name="start_location"
                                    rules={{ required: "Start location is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">From *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="123 Main St, City, State" 
                                                    className="bg-slate-800 border-slate-600 text-slate-50"
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
                                    rules={{ required: "End location is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">To *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="456 Oak Ave, City, State" 
                                                    className="bg-slate-800 border-slate-600 text-slate-50"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Calculate Button */}
                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    onClick={handleCalculate}
                                    disabled={isCalculating}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isCalculating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Calculating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Brain className="h-4 w-4" />
                                            Calculate Mileage
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* AI Response */}
                            {aiResponse && (
                                <div className={`p-4 rounded-lg border ${
                                    aiResponse.success 
                                        ? 'bg-green-900/20 border-green-700 text-green-100' 
                                        : 'bg-red-900/20 border-red-700 text-red-100'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {aiResponse.success ? (
                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-400" />
                                        )}
                                        <span className="font-medium">
                                            {aiResponse.success ? 'Route Calculated' : 'Calculation Failed'}
                                        </span>
                                    </div>
                                    {aiResponse.success ? (
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Distance:</span>
                                                <Badge variant="outline" className="bg-green-800/20 text-green-300 border-green-600">
                                                    {aiResponse.miles.toFixed(1)} miles
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Duration:</span>
                                                <span className="text-green-300">{aiResponse.duration}</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-xs text-green-400">{aiResponse.route}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-red-300">
                                            {aiResponse.error || 'Unable to calculate route. Please check your locations and try again.'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Purpose */}
                        <FormField
                            control={form.control}
                            name="purpose"
                            rules={{ required: "Purpose is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Purpose *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            placeholder="Client meeting, site visit, etc." 
                                            className="bg-slate-800 border-slate-600 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Business Trip Checkbox */}
                        <FormField
                            control={form.control}
                            name="is_business"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange}
                                                className="border-slate-600"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-slate-300">
                                            Business trip (eligible for tax deduction at $0.67/mile)
                                        </FormLabel>
                                    </div>
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
                                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-50">
                                                <SelectValue placeholder="Select customer..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-600">
                                                {customers.map((c) => (
                                                    <SelectItem 
                                                        key={c.id} 
                                                        value={c.id}
                                                        className="text-slate-50 hover:bg-slate-700 focus:bg-slate-700"
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
                                            className="bg-slate-800 border-slate-600 text-slate-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex justify-end space-x-2 pt-6">
                            <DialogClose asChild>
                                <Button variant="ghost" disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                variant="outline" 
                                type="submit" 
                                disabled={isSubmitting || !aiResponse?.success || !aiResponse?.miles || aiResponse.miles <= 0}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Mileage Entry'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}