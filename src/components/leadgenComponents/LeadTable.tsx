'use client';

import React, { useState } from "react";
import { Lead } from "@/types/leadgen";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building2,
  DollarSign,
  Calendar,
  Star,
  UserPlus
} from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onConvertToCustomer?: (leadId: string) => void;
}

const MobileLeadCard = React.memo(function MobileLeadCard({ lead, onEdit, onDelete, onConvertToCustomer }: { 
  lead: Lead; 
  onEdit?: (lead: Lead) => void; 
  onDelete?: (leadId: string) => void; 
  onConvertToCustomer?: (leadId: string) => void;
}) {
  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-green-100 text-green-800",
    proposal_sent: "bg-purple-100 text-purple-800",
    negotiating: "bg-orange-100 text-orange-800",
    closed_won: "bg-emerald-100 text-emerald-800",
    closed_lost: "bg-red-100 text-red-800",
    nurturing: "bg-gray-100 text-gray-800",
    converted: "bg-teal-100 text-teal-800",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {lead.first_name} {lead.last_name}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge 
                className={`${statusColors[lead.status as keyof typeof statusColors] || statusColors.new}`}
              >
                {lead.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge 
                className={`${priorityColors[lead.priority as keyof typeof priorityColors] || priorityColors.medium}`}
              >
                {lead.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {onConvertToCustomer && lead.status !== 'converted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConvertToCustomer(lead.id)}
                className="text-green-600 hover:text-green-700"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(lead)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Confirm deletion</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                      Are you sure you want to permanently delete this lead for {lead.first_name} {lead.last_name}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex justify-end space-x-2 pt-4">
                    <AlertDialogCancel asChild>
                      <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button variant="destructive" onClick={() => onDelete(lead.id)}>
                        Yes, delete
                      </Button>
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {lead.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{lead.company}</span>
              {lead.job_title && <span>• {lead.job_title}</span>}
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{lead.email}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{lead.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{lead.score}/100</span>
            </div>
            
            {lead.estimated_value && (
              <div className="flex items-center gap-1" title="Estimated deal value - for reference only">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">~${lead.estimated_value.toLocaleString()}</span>
              </div>
            )}
            
            {lead.expected_close_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>{new Date(lead.expected_close_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <Badge variant="outline" className="text-xs">
            {lead.source === 'manual' ? 'Manual Entry' : 'AI Generated'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

function LeadTable({ leads, onEdit, onDelete, onConvertToCustomer }: LeadTableProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we should show mobile view
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Throttle resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    checkMobile();
    window.addEventListener('resize', throttledCheckMobile, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', throttledCheckMobile);
    };
  }, []);

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-green-100 text-green-800",
    proposal_sent: "bg-purple-100 text-purple-800",
    negotiating: "bg-orange-100 text-orange-800",
    closed_won: "bg-emerald-100 text-emerald-800",
    closed_lost: "bg-red-100 text-red-800",
    nurturing: "bg-gray-100 text-gray-800",
    converted: "bg-teal-100 text-teal-800",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {leads.map((lead) => (
          <MobileLeadCard
            key={lead.id}
            lead={lead}
            onEdit={onEdit}
            onDelete={onDelete}
            onConvertToCustomer={onConvertToCustomer}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className="card-enhanced" data-appear>
      <CardHeader>
        <CardTitle>Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Est. Deal Value</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {lead.first_name} {lead.last_name}
                    </div>
                    {lead.job_title && (
                      <div className="text-sm text-muted-foreground">
                        {lead.job_title}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {lead.company || "-"}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {lead.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    className={`${statusColors[lead.status as keyof typeof statusColors] || statusColors.new}`}
                  >
                    {lead.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    className={`${priorityColors[lead.priority as keyof typeof priorityColors] || priorityColors.medium}`}
                  >
                    {lead.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{lead.score}/100</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {lead.estimated_value ? (
                    <span className="text-muted-foreground" title="Estimated deal value - for reference only">
                      ~${lead.estimated_value.toLocaleString()}
                    </span>
                  ) : "-"}
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline">
                    {lead.source === 'manual' ? 'Manual' : 'AI'}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-2">
                    {onConvertToCustomer && lead.status !== 'converted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConvertToCustomer(lead.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Convert to Customer"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(lead)}
                        title="Edit Lead"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Confirm deletion</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-300">
                              Are you sure you want to permanently delete this lead for {lead.first_name} {lead.last_name}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end space-x-2 pt-4">
                            <AlertDialogCancel asChild>
                              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button variant="destructive" onClick={() => onDelete(lead.id)}>
                                Yes, delete
                              </Button>
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {leads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No leads found. Create your first lead to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(LeadTable, (prevProps, nextProps) => {
  // Only re-render if leads array or callback functions have actually changed
  return (
    prevProps.leads.length === nextProps.leads.length &&
    prevProps.leads.every((lead, index) => lead.id === nextProps.leads[index]?.id) &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onConvertToCustomer === nextProps.onConvertToCustomer
  );
});