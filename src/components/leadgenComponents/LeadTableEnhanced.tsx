'use client';

import React, { useState } from "react";
import { Lead } from "@/types/leadgen";
import { cn } from '@/lib/utils';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  DollarSign,
  Calendar,
  Star,
  UserPlus,
  Building,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  Globe,
  Linkedin
} from "lucide-react";

import { ModernTable, ModernColumn } from '@/components/ui/modern-table';
import { exportLeads } from '@/app/lib/services/leadServices/exportLeads';
import EmailDraftsDisplay from "./EmailDraftsDisplay";

interface LeadTableEnhancedProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onConvertToCustomer?: (leadId: string) => void;
  onViewEmails?: (lead: Lead) => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

// Business Intelligence Modal Component (preserved exactly)
const BusinessIntelligenceModal = React.memo(function BusinessIntelligenceModal({ lead }: { lead: Lead }) {
  const hasBusinessIntelligence = lead.business_summary || lead.automation_opportunities || 
    lead.technology_stack || lead.growth_indicators || lead.recent_activities;
  
  if (!hasBusinessIntelligence) {
    return <span className="text-xs text-muted-foreground">No data</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50 transition-colors">
          <Building className="h-3 w-3 mr-1" />
          View Intel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Business Intelligence - {lead.company}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Comprehensive business research and analysis for {lead.first_name} {lead.last_name}
          </DialogDescription>
        </DialogHeader>
        
        {/* Company Links Section */}
        {(lead.website_url || lead.linkedin_url) && (
          <div className="mb-6">
            <Card className="border-border bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4" />
                  Company Links
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-3">
                  {lead.website_url && (
                    <a 
                      href={lead.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                  {lead.linkedin_url && (
                    <a 
                      href={lead.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Page
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Overview Section */}
          <div className="space-y-4">
            {/* Business Summary */}
            {lead.business_summary && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-primary flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    Business Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.business_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Technology Stack */}
            {lead.technology_stack && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-500 flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    Current Technology
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.technology_stack}</p>
                </CardContent>
              </Card>
            )}

            {/* Growth Indicators */}
            {lead.growth_indicators && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-orange-500 flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Growth Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.growth_indicators}</p>
                </CardContent>
              </Card>
            )}

            {/* Business History */}
            {lead.business_history && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-indigo-500 flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Business History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.business_history}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Opportunities & Analysis Section */}
          <div className="space-y-4">
            {/* Service Opportunities */}
            {lead.automation_opportunities && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-500 flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4" />
                    Automation Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.automation_opportunities}</p>
                </CardContent>
              </Card>
            )}

            {/* Budget Indicators */}
            {lead.budget_indicators && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-600 flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Budget Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.budget_indicators}</p>
                </CardContent>
              </Card>
            )}

            {/* Competitive Landscape */}
            {lead.competitive_landscape && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-500 flex items-center gap-2 text-base">
                    <Target className="h-4 w-4" />
                    Competitive Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.competitive_landscape}</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Activities */}
            {lead.recent_activities && (
              <Card className="border-border bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-500 flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{lead.recent_activities}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default function LeadTableEnhanced({ 
  leads, 
  onEdit, 
  onDelete, 
  onConvertToCustomer, 
  onViewEmails,
  loading = false,
  title = "Leads",
  description = "Manage and track your sales leads"
}: LeadTableEnhancedProps) {
  // State for email drafts modal
  const [emailDraftsOpen, setEmailDraftsOpen] = useState(false);
  const [selectedLeadForEmails, setSelectedLeadForEmails] = useState<Lead | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Email drafts handling
  const handleViewEmails = (lead: Lead) => {
    setSelectedLeadForEmails(lead);
    setEmailDraftsOpen(true);
    if (onViewEmails) {
      onViewEmails(lead);
    }
  };

  const handleCloseEmailDrafts = () => {
    setEmailDraftsOpen(false);
    setSelectedLeadForEmails(null);
  };

  // Export handling
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const result = await exportLeads(format);
      if (result.success && result.data && result.filename) {
        // Download the file
        const blob = new Blob([result.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        console.error('Export failed:', result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Modern status and priority color mappings
  const getStatusBadgeProps = (status: string) => {
    const statusMap = {
      new: { className: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
      contacted: { className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
      qualified: { className: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800" },
      proposal_sent: { className: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800" },
      negotiating: { className: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800" },
      closed_won: { className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
      closed_lost: { className: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800" },
      nurturing: { className: "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800" },
      converted: { className: "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.new;
  };

  const getPriorityBadgeProps = (priority: string) => {
    const priorityMap = {
      low: { className: "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800" },
      medium: { className: "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" },
      high: { className: "bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800" },
      urgent: { className: "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800" },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  // Column definitions for the modern table
  const columns: ModernColumn<Lead>[] = [
    {
      id: 'name',
      key: 'first_name',
      label: 'Name',
      primary: true,
      sortable: true,
      searchable: true,
      render: (_, lead) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {lead.first_name} {lead.last_name}
          </div>
          {lead.job_title && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {lead.job_title}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'company',
      key: 'company',
      label: 'Company',
      primary: true,
      sortable: true,
      searchable: true,
      width: '180px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 dark:text-gray-100 font-medium truncate" title={value as string || "-"}>
            {(value as string) || "-"}
          </span>
        </div>
      )
    },
    {
      id: 'contact',
      key: 'email',
      label: 'Contact',
      hideOnMobile: true,
      width: '200px',
      render: (_, lead) => (
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[180px]" title={lead.email}>{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span title={lead.phone}>{lead.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'status',
      key: 'status',
      label: 'Status',
      primary: true,
      sortable: true,
      filterable: true,
      render: (value) => {
        const status = value as string;
        const badgeProps = getStatusBadgeProps(status);
        return (
          <Badge className={cn("px-2.5 py-0.5 text-xs font-medium rounded-full", badgeProps.className)}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      }
    },
    {
      id: 'priority',
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      hideOnMobile: true,
      render: (value) => {
        const priority = value as string;
        const badgeProps = getPriorityBadgeProps(priority);
        return (
          <Badge className={badgeProps.className}>
            {priority.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      id: 'score',
      key: 'score',
      label: 'Score',
      sortable: true,
      hideOnMobile: true,
      align: 'center',
      width: '100px',
      render: (value) => (
        <div className="flex items-center justify-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-foreground">{(value as number)}/100</span>
        </div>
      )
    },
    {
      id: 'estimated_value',
      key: 'estimated_value',
      label: 'Est. Deal Value',
      sortable: true,
      hideOnMobile: true,
      align: 'center',
      width: '140px',
      render: (value) => {
        const estimatedValue = value as number;
        return (
          <div className="text-center">
            {estimatedValue ? (
              <span className="text-muted-foreground" title="Estimated deal value - for reference only">
                ~${estimatedValue.toLocaleString()}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        );
      }
    },
    {
      id: 'business_intel',
      key: 'business_summary',
      label: 'Business Intel',
      hideOnMobile: true,
      align: 'center',
      width: '140px',
      render: (_, lead) => (
        <div className="flex items-center justify-center">
          <BusinessIntelligenceModal lead={lead} />
        </div>
      )
    },
    {
      id: 'actions',
      key: 'id',
      label: 'Actions',
      align: 'center',
      sticky: true,
      width: '160px',
      render: (_, lead) => (
        <div className="flex gap-1 justify-center min-w-[140px]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewEmails(lead)}
            title="View Email Drafts"
            className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
          >
            <Mail className="h-4 w-4" />
          </Button>
          {onConvertToCustomer && lead.status !== 'converted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConvertToCustomer(lead.id)}
              className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
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
              className="h-8 w-8 p-0"
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
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to permanently delete this lead for {lead.first_name} {lead.last_name}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-end space-x-2 pt-4">
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancel</Button>
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
      )
    }
  ];

  // Expanded row content for mobile (currently not used in ModernTable)
  /*
  const renderExpanded = (lead: Lead) => (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="font-medium text-muted-foreground block mb-1">Priority:</span>
          <Badge className={getPriorityBadgeProps(lead.priority).className}>
            {lead.priority.toUpperCase()}
          </Badge>
        </div>
        <div>
          <span className="font-medium text-muted-foreground block mb-1">Score:</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>{lead.score}/100</span>
          </div>
        </div>
      </div>
      
      {lead.estimated_value && (
        <div>
          <span className="font-medium text-muted-foreground block mb-1 text-xs">Est. Deal Value:</span>
          <span className="text-sm">~${lead.estimated_value.toLocaleString()}</span>
        </div>
      )}
      
      <div className="flex gap-2 pt-2">
        <BusinessIntelligenceModal lead={lead} />
        <Badge variant="outline" className="text-xs">
          {lead.source === 'manual' ? 'Manual Entry' : 'AI Generated'}
        </Badge>
      </div>
    </div>
  );
  */

  return (
    <>
      <ModernTable
        data={leads}
        columns={columns}
        keyExtractor={(lead) => lead.id}
        title={title}
        description={description}
        loading={loading}
        searchable={true}
        sortable={true}
        exportable={true}
        exportService={{
          onExport: handleExport,
          isExporting
        }}
        emptyState={{
          title: "No leads found",
          description: "Create your first lead to get started with lead management.",
          icon: <Users className="h-8 w-8 text-gray-400" />,
        }}
        className="w-full"
      />
      
      {/* Email Drafts Modal */}
      {selectedLeadForEmails && emailDraftsOpen && (
        <EmailDraftsDisplay
          leadId={selectedLeadForEmails.id}
          lead={selectedLeadForEmails}
          isOpen={emailDraftsOpen}
          onClose={handleCloseEmailDrafts}
        />
      )}
    </>
  );
}