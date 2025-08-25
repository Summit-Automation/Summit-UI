'use client';

import React, { useState } from "react";
import { Lead } from "@/types/leadgen";
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

import { EnhancedTable, EnhancedColumn } from '@/components/ui/enhanced-table';
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border">
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

  // Status and priority color mappings
  const getStatusBadgeProps = (status: string) => {
    const statusMap = {
      new: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      contacted: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
      qualified: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      proposal_sent: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
      negotiating: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
      closed_won: { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
      closed_lost: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      nurturing: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300" },
      converted: { className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.new;
  };

  const getPriorityBadgeProps = (priority: string) => {
    const priorityMap = {
      low: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300" },
      medium: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      high: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
      urgent: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  // Column definitions for the enhanced table
  const columns: EnhancedColumn<Lead>[] = [
    {
      id: 'name',
      key: 'first_name',
      label: 'Name',
      primary: true,
      sortable: true,
      searchable: true,
      render: (_, lead) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">
            {lead.first_name} {lead.last_name}
          </div>
          {lead.job_title && (
            <div className="text-xs text-muted-foreground">
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
      render: (value) => (
        <span className="text-foreground">{(value as string) || "-"}</span>
      )
    },
    {
      id: 'contact',
      key: 'email',
      label: 'Contact',
      hideOnMobile: true,
      render: (_, lead) => (
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[150px]">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span>{lead.phone}</span>
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
          <Badge className={badgeProps.className}>
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
      align: 'right',
      render: (value) => {
        const estimatedValue = value as number;
        return estimatedValue ? (
          <span className="text-muted-foreground" title="Estimated deal value - for reference only">
            ~${estimatedValue.toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      }
    },
    {
      id: 'source',
      key: 'source',
      label: 'Source',
      sortable: true,
      filterable: true,
      hideOnMobile: true,
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value === 'manual' ? 'Manual' : 'AI'}
        </Badge>
      )
    },
    {
      id: 'business_intel',
      key: 'business_summary',
      label: 'Business Intel',
      hideOnMobile: true,
      render: (_, lead) => <BusinessIntelligenceModal lead={lead} />
    },
    {
      id: 'actions',
      key: 'id',
      label: 'Actions',
      align: 'center',
      sticky: true,
      render: (_, lead) => (
        <div className="flex gap-1 justify-center">
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

  // Expanded row content for mobile
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

  return (
    <>
      <EnhancedTable
        data={leads}
        columns={columns}
        keyExtractor={(lead) => lead.id}
        title={title}
        description={description}
        loading={loading}
        searchable={true}
        filterable={true}
        sortable={true}
        exportable={true}
        exportService={{
          onExport: handleExport,
          isExporting
        }}
        renderExpanded={renderExpanded}
        emptyState={{
          title: "No leads found",
          description: "Create your first lead to get started with lead management.",
          icon: <Users className="h-8 w-8 text-muted-foreground" />,
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