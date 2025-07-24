'use client';

import * as React from 'react';
import {RecurringPayment} from '@/types/recurringPayment';
import {Button} from '@/components/ui/button';
import {deleteRecurringPayment} from '@/app/lib/services/bookkeeperServices/deleteRecurringPayment';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import EditRecurringPaymentClientWrapper from './EditRecurringPaymentClientWrapper';

export default function RecurringPaymentsTable({
    recurringPayments,
    onUpdate,
}: {
    recurringPayments: RecurringPayment[];
    onUpdate?: () => void;
}) {
    const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});


    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this recurring payment?')) return;
        
        setLoadingStates(prev => ({...prev, [id]: true}));
        
        try {
            const result = await deleteRecurringPayment(id);
            
            if (result.success) {
                onUpdate?.();
            } else {
                console.error('Delete failed:', result.error);
                alert('Failed to delete recurring payment. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting recurring payment:', error);
            alert('Failed to delete recurring payment. Please try again.');
        } finally {
            setLoadingStates(prev => ({...prev, [id]: false}));
        }
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
                        
                        <CardContent className="space-y-4">
                            {/* Main Info Row */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            payment.type === 'income' 
                                                ? 'bg-green-900/50 text-green-300 border border-green-700' 
                                                : 'bg-red-900/50 text-red-300 border border-red-700'
                                        }`}>
                                            {payment.type === 'income' ? 'Income' : 'Expense'}
                                        </span>
                                        <span className="text-slate-400 text-sm">{payment.category}</span>
                                    </div>
                                    
                                    <div className="text-slate-300 text-sm mb-3">
                                        {payment.customer_name && (
                                            <span className="text-blue-400">Customer: {payment.customer_name} • </span>
                                        )}
                                        <span>{getFrequencyLabel(payment.frequency)}</span>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className={`text-xl font-bold ${
                                        payment.type === 'income' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {payment.type === 'income' ? '+' : '-'}{formatAmount(payment.amount)}
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        Next: {formatDate(payment.next_payment_date)}
                                    </div>
                                </div>
                            </div>

                            {/* Progress and Actions */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-slate-400">
                                    Processed: <span className="text-white">{payment.payments_processed}</span>
                                    {payment.payment_limit && <span className="text-slate-500"> / {payment.payment_limit}</span>}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <EditRecurringPaymentClientWrapper
                                        payment={payment}
                                        onSuccess={onUpdate}
                                    />
                                    
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(payment.id)}
                                        disabled={loadingStates[payment.id]}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}