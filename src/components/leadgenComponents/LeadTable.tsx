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
  Building2,
  DollarSign,
  Calendar,
  Star,
  UserPlus,
  Building,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  CheckCircle,
  Globe,
  Linkedin
} from "lucide-react";
import EmailDraftsDisplay from "./EmailDraftsDisplay";

interface LeadTableProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onConvertToCustomer?: (leadId: string) => void;
  onViewEmails?: (lead: Lead) => void;
}

// Business Intelligence Modal Component
const BusinessIntelligenceModal = React.memo(function BusinessIntelligenceModal({ lead }: { lead: Lead }) {
  const hasBusinessIntelligence = lead.business_summary || lead.automation_opportunities || 
    lead.technology_stack || lead.growth_indicators || lead.recent_activities;
  
  if (!hasBusinessIntelligence) {
    return <span className="text-xs text-gray-400">No data</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Building className="h-3 w-3 mr-1" />
          View Intel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-400" />
            Business Intelligence - {lead.company}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Comprehensive business research and analysis for {lead.first_name} {lead.last_name}
          </DialogDescription>
        </DialogHeader>
        
        {/* Company Links Section */}
        {(lead.website_url || lead.linkedin_url) && (
          <div className="mb-6">
            <Card className="border-slate-600 bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 flex items-center gap-2 text-base">
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
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
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
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm transition-colors"
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
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    Business Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-300 leading-relaxed">{lead.business_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Technology Stack */}
            {lead.technology_stack && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-400 flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    Current Technology
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-300 leading-relaxed">{lead.technology_stack}</p>
                </CardContent>
              </Card>
            )}

            {/* Growth Indicators */}
            {lead.growth_indicators && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-orange-400 flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Growth Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-300 leading-relaxed">{lead.growth_indicators}</p>
                </CardContent>
              </Card>
            )}

            {/* Business History */}
            {lead.business_history && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-indigo-400 flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Business History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-300 leading-relaxed">{lead.business_history}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Opportunities & Analysis Section */}
          <div className="space-y-4">
            {/* Service Opportunities */}
            {lead.automation_opportunities && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 flex items-center gap-2 text-base">
                    <Target className="h-4 w-4" />
                    How You Can Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-300 leading-relaxed">{lead.automation_opportunities}</p>
                </CardContent>
              </Card>
            )}

            {/* Budget Indicators */}
            {lead.budget_indicators && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-400 flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Budget Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-300 leading-relaxed">{lead.budget_indicators}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Contacts */}
            {lead.additional_contacts && lead.additional_contacts.length > 0 && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-cyan-400 flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
                    Key Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {lead.additional_contacts.map((contact, index) => (
                      <div key={index} className="border-l-2 border-slate-600 pl-3">
                        <div className="font-medium text-slate-200">{contact.name} - {contact.title}</div>
                        <div className="text-xs text-slate-400">{contact.role}</div>
                        <div className="text-xs text-slate-400 mt-1">{contact.contact_method}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selection Reasoning for AI leads */}
            {lead.source === 'ai_agent' && lead.selection_reasoning && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-yellow-400 flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4" />
                    Why This Lead
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-300 leading-relaxed">{lead.selection_reasoning}</p>
                </CardContent>
              </Card>
            )}

            {/* Verification Sources */}
            {lead.verification_sources && lead.verification_sources.length > 0 && (
              <Card className="border-slate-600 bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 flex items-center gap-2 text-base">
                    <CheckCircle className="h-4 w-4" />
                    Verified Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {lead.verification_sources.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {source.includes('linkedin') && <Linkedin className="h-3 w-3 mr-1" />}
                        {source.length > 40 ? `${source.substring(0, 40)}...` : source}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

const MobileLeadCard = React.memo(function MobileLeadCard({ lead, onEdit, onDelete, onConvertToCustomer, onViewEmails }: { 
  lead: Lead; 
  onEdit?: (lead: Lead) => void; 
  onDelete?: (leadId: string) => void; 
  onConvertToCustomer?: (leadId: string) => void;
  onViewEmails?: (lead: Lead) => void;
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
            {onViewEmails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewEmails(lead)}
                title="View Email Drafts"
                className="text-blue-600 hover:text-blue-700"
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
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

          {/* Business Intelligence for Mobile */}
          <BusinessIntelligenceModal lead={lead} />
        </div>
      </CardContent>
    </Card>
  );
});

function LeadTable({ leads, onEdit, onDelete, onConvertToCustomer, onViewEmails }: LeadTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [emailDraftsOpen, setEmailDraftsOpen] = useState(false);
  const [selectedLeadForEmails, setSelectedLeadForEmails] = useState<Lead | null>(null);

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

  return (
    <>
      {isMobile ? (
        <div className="space-y-4">
          {leads.map((lead) => (
            <MobileLeadCard
              key={lead.id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
              onConvertToCustomer={onConvertToCustomer}
              onViewEmails={handleViewEmails}
            />
          ))}
        </div>
      ) : (
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
                  <TableHead>Business Intel</TableHead>
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
                      <BusinessIntelligenceModal lead={lead} />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEmails(lead)}
                          title="View Email Drafts"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
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
      )}
      
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

export default LeadTable;