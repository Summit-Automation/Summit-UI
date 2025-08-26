'use client';

import { useMemo, useState } from 'react';
import { ModernTable, ModernColumn } from '@/components/ui/modern-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building, Trash2, AlertCircle, Search, X, ChevronDown, ChevronUp, MessageSquare, Calendar, User } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
    
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

    // Check if customer has any interactions requiring follow-up
    const hasFollowUpRequired = (customerId: string) => {
        const customerInteractions = interactionsById.get(customerId) ?? [];
        return customerInteractions.some(interaction => interaction.follow_up_required);
    };

    const columns: ModernColumn<Customer>[] = [
        {
            id: 'full_name',
            key: 'full_name',
            label: 'Name',
            primary: true,
            sortable: true,
            searchable: true,
            width: 'minmax(180px, 2fr)',
            render: (value) => (
                <span className="font-semibold text-foreground truncate block" title={value as string || 'Not Specified'}>
                    {(value as string) || 'Not Specified'}
                </span>
            )
        },
        {
            id: 'status',
            key: 'status',
            label: 'Status',
            primary: true,
            sortable: true,
            filterable: true,
            width: '120px',
            render: (value) => (
                <Badge className={`${statusColor(value as string)} px-2 py-0.5 rounded-full text-xs`}>
                    {value as string}
                </Badge>
            )
        },
        {
            id: 'follow_up_required',
            key: 'follow_up_required',
            label: 'Follow-up',
            primary: true,
            align: 'center',
            width: '130px',
            render: (_, customer) => {
                const needsFollowUp = hasFollowUpRequired(customer.id);
                return (
                    <div className="flex items-center justify-center">
                        {needsFollowUp ? (
                            <Badge variant="destructive" className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                                <AlertCircle className="h-3 w-3" />
                                Required
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                        )}
                    </div>
                );
            }
        },
        {
            id: 'interactions',
            key: 'interactions',
            label: 'Interactions',
            primary: true,
            align: 'center',
            width: '140px',
            hideOnMobile: true,
            render: (_, customer) => {
                const customerInteractions = interactionsById.get(customer.id) ?? [];
                const isExpanded = expandedCustomer === customer.id;
                
                return (
                    <div className="flex items-center justify-center">
                        {customerInteractions.length > 0 ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}
                                className="h-8 px-2 text-xs hover:bg-slate-700/50 flex items-center gap-1"
                            >
                                <MessageSquare className="h-3 w-3" />
                                <span className="font-medium">{customerInteractions.length}</span>
                                {isExpanded ? (
                                    <ChevronUp className="h-3 w-3 ml-1" />
                                ) : (
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                )}
                            </Button>
                        ) : (
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                0
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            id: 'contact',
            key: 'email',
            label: 'Contact',
            sortable: true,
            searchable: true,
            hideOnMobile: true,
            width: 'minmax(200px, 2.5fr)',
            render: (value, customer) => (
                <div className="space-y-0.5">
                    <div className="text-foreground truncate text-sm" title={value as string}>
                        {value as string}
                    </div>
                    <div className="text-muted-foreground truncate text-xs" title={customer.phone}>
                        {customer.phone}
                    </div>
                </div>
            )
        },
        {
            id: 'business',
            key: 'business',
            label: 'Business',
            sortable: true,
            searchable: true,
            hideOnMobile: true,
            width: 'minmax(160px, 1.5fr)',
            render: (value) => (
                <span className="text-foreground truncate block" title={value as string || 'None'}>
                    {(value as string) || <span className="text-muted-foreground italic">None</span>}
                </span>
            )
        },
        {
            id: 'actions',
            key: 'id',
            label: 'Actions',
            align: 'center',
            sticky: true,
            width: '120px',
            render: (_, customer) => (
                <div className="flex items-center justify-center gap-1">
                    <UpdateCustomerModal
                        customer={customer}
                        onSuccess={() => router.refresh()}
                    />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                title="Delete Customer"
                            >
                                <Trash2 className="h-4 w-4" />
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
                            <div className="flex justify-end space-x-2 pt-4">
                                <AlertDialogCancel asChild>
                                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                                        Cancel
                                    </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => deleteCustomerHandler(customer.id)}
                                    >
                                        Delete Customer
                                    </Button>
                                </AlertDialogAction>
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    ];



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

            <ModernTable
                data={filteredCustomers}
                columns={columns}
                keyExtractor={(customer) => customer.id}
                title="Customer Overview"
                description="Manage customers and track interaction history"
                searchable={false}
                sortable={true}
                exportable={false}
                expandedRowRenderer={(customer) => {
                    if (expandedCustomer !== customer.id) return null;
                    const customerInteractions = interactionsById.get(customer.id) ?? [];
                    if (customerInteractions.length === 0) return null;
                    
                    return (
                        <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                    <MessageSquare className="h-4 w-4" />
                                    Interactions for {customer.full_name || 'Not Specified'}
                                </div>
                                <div className="grid gap-3 max-h-64 overflow-y-auto">
                                    {customerInteractions.map((interaction) => (
                                        <div 
                                            key={interaction.id} 
                                            className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/50"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                                    <span className="font-medium text-sm text-slate-200 truncate">
                                                        {interaction.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(interaction.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge 
                                                    variant={interaction.type === 'call' ? 'default' : 'secondary'} 
                                                    className="text-xs px-2 py-0.5"
                                                >
                                                    {interaction.type}
                                                </Badge>
                                                {interaction.follow_up_required && (
                                                    <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                                        Follow-up Required
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {interaction.notes && (
                                                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
                                                    {interaction.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                }}
                emptyState={{
                    title: searchTerm ? "No customers match your search" : "No customers found",
                    description: searchTerm ? "Try adjusting your search terms" : "Start by adding your first customer to track relationships",
                    icon: <Building className="h-8 w-8 text-muted-foreground" />,
                }}
            />
        </div>
    );
}