'use client';

import {useMemo} from 'react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Table, TableBody, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import CustomerRow from '@/components/crmComponents/view/CustomerRow';
import CustomerCard from '@/components/crmComponents/view/CustomerCard';
import type {Customer} from '@/types/customer';
import type {Interaction} from '@/types/interaction';

interface Props {
    customers: Customer[];
    interactions: Interaction[];
}

export default function CRMCustomerView({customers, interactions}: Props) {
    // build a lookup map once
    const interactionsById = useMemo(() => {
        const map = new Map<string, Interaction[]>();
        interactions.forEach(i => {
            const arr = map.get(i.customer_id) ?? [];
            arr.push(i);
            map.set(i.customer_id, arr);
        });
        return map;
    }, [interactions]);

    return (<Tabs defaultValue="table" className="space-y-4">
        <TabsList>
            <TabsTrigger value="table">📊 Table View</TabsTrigger>
            <TabsTrigger value="cards">🗂️ Card View</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
            <ScrollArea className="h-[600px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Business</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Interactions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map(c => (<CustomerRow
                            key={c.id}
                            customer={c}
                            interactions={interactionsById.get(c.id) ?? []}
                        />))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </TabsContent>

        <TabsContent value="cards">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map(c => (<CustomerCard
                    key={c.id}
                    customer={c}
                    interactions={interactionsById.get(c.id) ?? []}
                />))}
            </div>
        </TabsContent>
    </Tabs>);
}
