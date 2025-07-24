'use client';

import * as React from 'react';
import {RecurringPayment} from '@/types/recurringPayment';
import {Button} from '@/components/ui/button';
import {updateRecurringPayment} from '@/app/lib/services/bookkeeperServices/updateRecurringPayment';
import {deleteRecurringPayment} from '@/app/lib/services/bookkeeperServices/deleteRecurringPayment';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Switch} from '@/components/ui/switch';

export default function RecurringPaymentsTable({
    recurringPayments,
    onUpdate,
}: {
    recurringPayments: RecurringPayment[];
    onUpdate?: () => void;
}) {
    const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

    const handleToggleActive = async (payment: RecurringPayment) => {
        setLoadingStates(prev => ({...prev, [payment.id]: true}));
        
        const result = await updateRecurringPayment({
            id: payment.id,
            is_active: !payment.is_active,
        });

        if (result.success) {
            onUpdate?.();
        }
        
        setLoadingStates(prev => ({...prev, [payment.id]: false}));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this recurring payment?')) return;
        
        setLoadingStates(prev => ({...prev, [id]: true}));
        
        const result = await deleteRecurringPayment(id);
        
        if (result.success) {
            onUpdate?.();
        }
        
        setLoadingStates(prev => ({...prev, [id]: false}));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatAmount = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(parseFloat(amount));
    };

    const getFrequencyLabel = (frequency: string) => {
        const labels = {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            quarterly: 'Quarterly',
            yearly: 'Yearly',
        };
        return labels[frequency as keyof typeof labels] || frequency;
    };

    const getStatusBadge = (payment: RecurringPayment) => {
        if (!payment.is_active) {
            return <Badge variant="secondary">Inactive</Badge>;
        }
        
        const nextPayment = new Date(payment.next_payment_date);
        const now = new Date();
        
        if (nextPayment <= now) {
            return <Badge variant="destructive">Due</Badge>;
        }
        
        return <Badge variant="default">Active</Badge>;
    };

    if (recurringPayments.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-6 text-center">
                    <p className="text-slate-400">No recurring payments found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recurring Payments</h3>
            
            <div className="grid gap-4">
                {recurringPayments.map((payment) => (
                    <Card key={payment.id} className="bg-slate-900 border-slate-700">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-base">
                                    {payment.description}
                                </CardTitle>
                                {getStatusBadge(payment)}
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Type</p>
                                    <p className="text-white capitalize">{payment.type}</p>
                                </div>
                                
                                <div>
                                    <p className="text-slate-400">Amount</p>
                                    <p className={`font-medium ${
                                        payment.type === 'income' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {payment.type === 'income' ? '+' : '-'}{formatAmount(payment.amount)}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-slate-400">Frequency</p>
                                    <p className="text-white">{getFrequencyLabel(payment.frequency)}</p>
                                </div>
                                
                                <div>
                                    <p className="text-slate-400">Next Payment</p>
                                    <p className="text-white">{formatDate(payment.next_payment_date)}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Category</p>
                                    <p className="text-white">{payment.category}</p>
                                </div>
                                
                                <div>
                                    <p className="text-slate-400">Payments Processed</p>
                                    <p className="text-white">
                                        {payment.payments_processed}
                                        {payment.payment_limit && ` / ${payment.payment_limit}`}
                                    </p>
                                </div>
                                
                                {payment.customer_name && (
                                    <div>
                                        <p className="text-slate-400">Customer</p>
                                        <p className="text-white">{payment.customer_name}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={payment.is_active}
                                        onCheckedChange={() => handleToggleActive(payment)}
                                        disabled={loadingStates[payment.id]}
                                    />
                                    <span className="text-sm text-slate-300">
                                        {payment.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(payment.id)}
                                    disabled={loadingStates[payment.id]}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}