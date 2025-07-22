'use client';

import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileTable } from '@/components/ui/mobile-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, Mail, Building, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import UpdateCustomerModal from '@/components/crmComponents/UpdateCustomerModal';
import { deleteCustomer } from '@/app/lib/services/crmServices/customer/deleteCustomer';
import { useRouter } from 'next/navigation';
import type { Customer } from '@/types/customer';
import type { Interaction } from '@/types/interaction';
import { statusColor } from '@/lib/crmUtils';

interface Props {
    customers: Customer[];
    interactions: Interaction[];
}

export default function CRMCustomerView({ customers, interactions }: Props) {
    const router = useRouter();
    
    // Build a lookup map once
    const interactionsById = useMemo(() => {
        const map = new Map<string, Interaction[]>();
        interactions.forEach(i => {
            const arr = map.get(i.customer_id) ?? [];
            arr.push(i);
            map.set(i.customer_id, arr);
        });
        return map;
    }, [interactions]);

    const deleteCustomerHandler = async (id: string) => {
        try {
            await deleteCustomer(id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete customer:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Check if customer has any interactions requiring follow-up
    const hasFollowUpRequired = (customerId: string) => {
        const customerInteractions = interactionsById.get(customerId) ?? [];
        return customerInteractions.some(interaction => interaction.follow_up_required);
    };

    const columns = [
        {
            key: 'full_name',
            label: 'Name',
            primary: true,
            render: (value: unknown) => (
                <span className="font-semibold text-white">{value as string}</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            primary: true,
            render: (value: unknown) => (
                <Badge className={`${statusColor(value as string)} px-3 py-0.5 rounded-full text-xs`}>
                    {value as string}
                </Badge>
            )
        },
        {
            key: 'follow_up_required',
            label: 'Follow-up',
            primary: true,
            render: (_: unknown, customer: Customer) => {
                const needsFollowUp = hasFollowUpRequired(customer.id);
                return needsFollowUp ? (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <AlertCircle className="h-3 w-3" />
                        Follow-up Needed
                    </Badge>
                ) : (
                    <span className="text-slate-500 text-xs">—</span>
                );
            }
        },
        {
            key: 'business',
            label: 'Business',
            render: (value: unknown) => (
                <span className="text-slate-200">
                    {(value as string) || <span className="text-slate-500 italic">None</span>}
                </span>
            )
        },
        {
            key: 'email',
            label: 'Email',
            hideOnMobile: true,
            render: (value: unknown) => (
                <span className="text-slate-200 truncate block max-w-xs">
                    {value as string}
                </span>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            hideOnMobile: true,
            render: (value: unknown) => (
                <span className="text-slate-200">{value as string}</span>
            )
        },
        {
            key: 'created_at',
            label: 'Created',
            hideOnMobile: true,
            render: (value: unknown) => (
                <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(value as string)}
                </div>
            )
        }
    ];

    const renderCustomerExpanded = (customer: Customer) => {
        const customerInteractions = interactionsById.get(customer.id) ?? [];
        const needsFollowUp = hasFollowUpRequired(customer.id);
        
        return (
            <div className="space-y-4">
                {/* Follow-up Status Alert */}
                {needsFollowUp && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-red-400 font-medium">
                            This customer has interactions requiring follow-up
                        </span>
                    </div>
                )}

                {/* Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="text-xs text-slate-400 uppercase">Email</div>
                            <div className="text-sm text-white truncate">{customer.email}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="text-xs text-slate-400 uppercase">Phone</div>
                            <div className="text-sm text-white">{customer.phone}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="text-xs text-slate-400 uppercase">Business</div>
                            <div className="text-sm text-white">
                                {customer.business || <span className="text-slate-500 italic">None</span>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="text-xs text-slate-400 uppercase">Created</div>
                            <div className="text-sm text-white">{formatDate(customer.created_at)}</div>
                        </div>
                    </div>
                </div>

                {/* Recent Interactions */}
                <div className="border-t border-slate-700 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">
                            Recent Interactions ({customerInteractions.length})
                        </span>
                    </div>
                    
                    {customerInteractions.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {customerInteractions.slice(0, 3).map((interaction) => (
                                <div key={interaction.id} className="bg-slate-800/30 rounded p-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-white">
                                            {interaction.title}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {formatDate(interaction.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-xs text-slate-400">
                                            {interaction.type} • {interaction.outcome || 'No outcome'}
                                        </div>
                                        {interaction.follow_up_required && (
                                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                                <AlertCircle className="h-2.5 w-2.5" />
                                                Follow-up
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {customerInteractions.length > 3 && (
                                <div className="text-xs text-slate-500 text-center">
                                    +{customerInteractions.length - 3} more interactions
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-slate-500 italic">
                            No interactions recorded yet
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-700">
                    <UpdateCustomerModal
                        customer={customer}
                        onSuccess={() => router.refresh()}
                    />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full sm:w-auto flex items-center justify-center space-x-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{customer.full_name}</strong>? 
                                    This action cannot be undone and will also remove all associated interactions.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
                                <AlertDialogCancel asChild>
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        Cancel
                                    </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => deleteCustomerHandler(customer.id)}
                                        className="w-full sm:w-auto"
                                    >
                                        Delete Customer
                                    </Button>
                                </AlertDialogAction>
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        );
    };

    // Legacy card view component for comparison
    const CardView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map(customer => {
                const customerInteractions = interactionsById.get(customer.id) ?? [];
                
                return (
                    <div 
                        key={customer.id}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-4"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white">{customer.full_name}</h3>
                                <Badge className={`${statusColor(customer.status)} px-2 py-1 text-xs`}>
                                    {customer.status}
                                </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Building className="w-4 h-4" />
                                    {customer.business || 'No business'}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Phone className="w-4 h-4" />
                                    {customer.phone}
                                </div>
                            </div>
                            
                            <div className="text-xs text-slate-500">
                                {customerInteractions.length} interactions • 
                                Created {formatDate(customer.created_at)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Tabs defaultValue="table" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
                <MobileTable
                    data={customers}
                    columns={columns}
                    renderExpanded={renderCustomerExpanded}
                    keyExtractor={(customer) => customer.id}
                    emptyMessage="No customers found"
                />
            </TabsContent>

            <TabsContent value="cards">
                <CardView />
            </TabsContent>
        </Tabs>
    );
}