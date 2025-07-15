'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import CustomerRow from '@/components/crmComponents/view/customerTableView/CustomerRow';
import CustomerCard from '@/components/crmComponents/view/customerCardView/CustomerCard';

import { Customer } from '@/types/customer';
import { Interaction } from '@/types/interaction';

interface Props {
    customers: Customer[];
    interactions: Interaction[];
}

export default function CRMCustomerView({ customers, interactions }: Props) {
    return (
        <Tabs defaultValue="table" className="space-y-4">
            {/* 1) The toggle buttons */}
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((c) => (
                                <CustomerRow
                                    key={c.id}
                                    customer={c}
                                    interactions={interactions.filter(i => i.customer_id === c.id)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </TabsContent>

            <TabsContent value="cards">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map((c) => (
                        <CustomerCard
                            key={c.id}
                            customer={c}
                            interactions={interactions.filter(i => i.customer_id === c.id)}
                        />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}
