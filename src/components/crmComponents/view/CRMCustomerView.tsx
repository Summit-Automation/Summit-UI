'use client';

import { useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Phone, Mail, Building, Trash2, MessageSquare, AlertCircle, Search, X } from 'lucide-react';
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
import UpdateInteractionModalClientWrapper from '@/components/crmComponents/CRMActions/UpdateInteractionClientWrapper';
import InteractionNotesDisplay from '@/components/crmComponents/view/InteractionNotesDisplay';
import { deleteCustomer } from '@/app/lib/services/crmServices/customer/deleteCustomer';
import { deleteInteraction } from '@/app/lib/services/crmServices/interaction/deleteInteraction';
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
    const [searchTerm, setSearchTerm] = useState('');
    
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

    // Filter customers based on search term
    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers;
        
        const term = searchTerm.toLowerCase();
        return customers.filter(customer => 
            (customer.full_name || 'Not Specified').toLowerCase().includes(term) ||
            customer.email.toLowerCase().includes(term) ||
            customer.phone.includes(term) ||
            (customer.business?.toLowerCase().includes(term))
        );
    }, [customers, searchTerm]);

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
            sortable: true,
            render: (value: unknown) => (
                <span className="font-semibold text-foreground">
                    {(value as string) || 'Not Specified'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            primary: true,
            sortable: true,
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
                    <Badge variant="destructive" className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <AlertCircle className="h-3 w-3" />
                        Follow-up Needed
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                );
            }
        },
        {
            key: 'business',
            label: 'Business',
            sortable: true,
            render: (value: unknown) => (
                <span className="text-foreground">
                    {(value as string) || <span className="text-muted-foreground italic">None</span>}
                </span>
            )
        },
        {
            key: 'email',
            label: 'Email',
            hideOnMobile: true,
            sortable: true,
            render: (value: unknown) => (
                <span className="text-foreground truncate block max-w-xs">
                    {value as string}
                </span>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            hideOnMobile: true,
            sortable: true,
            render: (value: unknown) => (
                <span className="text-foreground">{value as string}</span>
            )
        },
        {
            key: 'created_at',
            label: 'Created',
            hideOnMobile: true,
            sortable: true,
            render: (value: unknown) => (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {customerInteractions.slice(0, 5).map((interaction) => (
                                <div key={interaction.id} className="bg-slate-800 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                                    {/* Desktop Layout */}
                                    <div className="hidden sm:block p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate mb-1">
                                                    {interaction.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="capitalize">{interaction.type}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(interaction.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                <UpdateInteractionModalClientWrapper
                                                    interaction={interaction}
                                                    onSuccess={() => router.refresh()}
                                                />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-3.5 h-3.5"/>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">Delete Interaction?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-slate-300">
                                                                This will permanently delete &ldquo;{interaction.title}&rdquo;. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="flex justify-end space-x-2 pt-4">
                                                            <AlertDialogCancel asChild>
                                                                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={async () => {
                                                                        await deleteInteraction(interaction.id);
                                                                        router.refresh();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogAction>
                                                        </div>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                        
                                        {/* Outcome and Follow-up */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs text-slate-400">
                                                <span className="font-medium">Outcome:</span> {interaction.outcome || 'No outcome recorded'}
                                            </div>
                                            {interaction.follow_up_required && (
                                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Follow-up needed
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Notes with expand/collapse */}
                                        {interaction.notes && (
                                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-1 font-medium">Notes:</div>
                                                <InteractionNotesDisplay notes={interaction.notes} maxLength={80} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Layout */}
                                    <div className="sm:hidden p-3 space-y-3">
                                        {/* Header with actions */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white mb-1">
                                                    {interaction.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Badge className="bg-slate-700 text-slate-300 px-2 py-0.5 text-xs capitalize">
                                                        {interaction.type}
                                                    </Badge>
                                                    <span>{formatDate(interaction.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                                <UpdateInteractionModalClientWrapper
                                                    interaction={interaction}
                                                    onSuccess={() => router.refresh()}
                                                />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-3.5 h-3.5"/>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">Delete Interaction?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-slate-300">
                                                                This will permanently delete &ldquo;{interaction.title}&rdquo;. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="flex justify-end space-x-2 pt-4">
                                                            <AlertDialogCancel asChild>
                                                                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={async () => {
                                                                        await deleteInteraction(interaction.id);
                                                                        router.refresh();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogAction>
                                                        </div>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                        
                                        {/* Outcome */}
                                        {interaction.outcome && (
                                            <div className="space-y-1">
                                                <div className="text-xs text-slate-400 font-medium">Outcome:</div>
                                                <div className="text-xs text-slate-300">{interaction.outcome}</div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {interaction.notes && (
                                            <div className="space-y-1">
                                                <div className="text-xs text-slate-400 font-medium">Notes:</div>
                                                <InteractionNotesDisplay notes={interaction.notes} maxLength={120} />
                                            </div>
                                        )}

                                        {/* Follow-up badge */}
                                        {interaction.follow_up_required && (
                                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                                                <AlertCircle className="h-3 w-3" />
                                                Follow-up needed
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {customerInteractions.length > 5 && (
                                <div className="text-xs text-slate-500 text-center">
                                    +{customerInteractions.length - 5} more interactions
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
                        <AlertDialogContent className="bg-slate-900 border-slate-700">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-300">
                                    Are you sure you want to delete <strong>{customer.full_name || 'Not Specified'}</strong>? 
                                    This action cannot be undone and will also remove all associated interactions.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
                                <AlertDialogCancel asChild>
                                    <Button variant="outline" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800">
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


    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 icon-interactive" />
                <Input
                    type="text"
                    placeholder="Search customers by name, email, phone, or business..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-enhanced focus-enhanced pl-10 pr-10 h-12 rounded-lg transition-all duration-200"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 btn-feedback p-1 rounded icon-interactive"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Results Count */}
            {searchTerm && (
                <div className="text-sm text-muted-foreground">
                    {filteredCustomers.length} of {customers.length} customers {filteredCustomers.length === 1 ? 'matches' : 'match'} your search
                </div>
            )}

            <DataTable
                data={filteredCustomers}
                columns={columns}
                renderExpanded={renderCustomerExpanded}
                keyExtractor={(customer) => customer.id}
                emptyMessage={searchTerm ? "No customers match your search" : "No customers found"}
            />
        </div>
    );
}