'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Copy, 
  Edit, 
  Trash2, 
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { getEmailDrafts } from '@/app/lib/services/emailServices/getEmailDrafts';
import type { EmailDraft } from '@/types/emailGeneration';
import type { Lead } from '@/types/leadgen';

interface EmailDraftsDisplayProps {
  leadId: string;
  lead?: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EmailDraftWithLead extends EmailDraft {
  lead?: {
    first_name: string;
    last_name: string;
    company: string;
    email?: string;
  };
}

export default function EmailDraftsDisplay({
  leadId,
  lead,
  isOpen,
  onClose
}: EmailDraftsDisplayProps) {
  const [emailDrafts, setEmailDrafts] = useState<EmailDraftWithLead[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraftWithLead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<{ subject: string; body: string; index: number } | null>(null);

  const loadEmailDrafts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use secure server action instead of direct client query
      const response = await getEmailDrafts(leadId);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      // Convert server response to component format
      const formattedDrafts = response.data.map((draft: Record<string, unknown>) => ({
        ...draft,
        lead: lead ? {
          first_name: lead.first_name,
          last_name: lead.last_name,
          company: lead.company,
          email: lead.email
        } : null
      }));

      setEmailDrafts(formattedDrafts);
      if (formattedDrafts.length > 0) {
        setSelectedDraft(formattedDrafts[0]);
      }
    } catch (error) {
      console.error('Error loading email drafts:', error);
      toast.error('Failed to load email drafts');
    } finally {
      setIsLoading(false);
    }
  }, [leadId, lead]);

  useEffect(() => {
    if (isOpen && leadId) {
      loadEmailDrafts();
    }
  }, [isOpen, leadId, loadEmailDrafts]);

  const handleCopyEmail = async (subject: string, body: string) => {
    try {
      const emailText = `Subject: ${subject}\n\n${body}`;
      await navigator.clipboard.writeText(emailText);
      toast.success('Email copied to clipboard');
    } catch {
      toast.error('Failed to copy email');
    }
  };

  const handleEditEmail = (emailIndex: number, subject: string, body: string) => {
    setEditingEmail({ subject, body, index: emailIndex });
    setIsEditModalOpen(true);
  };

  const handleSaveEditedEmail = async () => {
    if (!editingEmail || !selectedDraft) return;

    try {
      const supabase = createClient();
      
      const updateData: Record<string, string> = {};
      const subjectField = `subject_line_${editingEmail.index + 1}`;
      const bodyField = `email_body_${editingEmail.index + 1}`;
      
      updateData[subjectField] = editingEmail.subject;
      updateData[bodyField] = editingEmail.body;

      const { error } = await supabase
        .from('email_drafts')
        .update(updateData)
        .eq('id', selectedDraft.id);

      if (error) throw error;

      toast.success('Email draft updated successfully');
      setIsEditModalOpen(false);
      setEditingEmail(null);
      await loadEmailDrafts();
    } catch (error) {
      console.error('Error updating email draft:', error);
      toast.error('Failed to update email draft');
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this email draft?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('email_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      toast.success('Email draft deleted successfully');
      await loadEmailDrafts();
      
      // If we deleted the selected draft, select the first remaining one
      if (selectedDraft?.id === draftId && emailDrafts.length > 1) {
        setSelectedDraft(emailDrafts[1]);
      } else if (emailDrafts.length <= 1) {
        setSelectedDraft(null);
      }
    } catch (error) {
      console.error('Error deleting email draft:', error);
      toast.error('Failed to delete email draft');
    }
  };

  const getEmailByIndex = (draft: EmailDraftWithLead, index: number) => {
    const subjects = [draft.subject_line_1, draft.subject_line_2, draft.subject_line_3];
    const bodies = [draft.email_body_1, draft.email_body_2, draft.email_body_3];
    
    return {
      subject: subjects[index] || '',
      body: bodies[index] || ''
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-500';
      case 'reviewed': return 'bg-blue-500';
      case 'sent': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-slate-500';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-slate-900 border-slate-700 rounded-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Drafts for {lead?.first_name} {lead?.last_name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {lead?.company} • {emailDrafts.length} draft{emailDrafts.length !== 1 ? 's' : ''} available
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : emailDrafts.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No email drafts found</p>
              <p className="text-slate-500 text-sm">Generate some emails to see them here</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mt-4 flex-1 overflow-hidden">
              {/* Left sidebar - Draft list */}
              <div className="lg:w-1/3 space-y-3 lg:overflow-y-auto">
                <h3 className="text-sm font-medium text-slate-300 mb-3">
                  Email Drafts ({emailDrafts.length})
                </h3>
                <div className="flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-x-visible">
                  {emailDrafts.map((draft) => (
                    <Card 
                      key={draft.id} 
                      className={`cursor-pointer border transition-all flex-shrink-0 lg:flex-shrink min-w-[200px] lg:min-w-0 ${
                        selectedDraft?.id === draft.id 
                          ? 'border-blue-500 bg-slate-800' 
                          : 'border-slate-600 bg-slate-700 hover:bg-slate-750'
                      }`}
                      onClick={() => setSelectedDraft(draft)}
                    >
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getStatusColor(draft.generation_status)} text-white text-xs`}>
                            {draft.generation_status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDraft(draft.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                        </div>
                        <p className="text-white text-xs lg:text-sm font-medium mb-1 truncate">
                          {draft.subject_line_1}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {formatDate(draft.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right content - Selected draft details */}
              <div className="flex-1 overflow-hidden">
                {selectedDraft ? (
                  <div className="flex flex-col h-full">
                    <Tabs defaultValue="email1" className="flex flex-col h-full">
                      <TabsList className="bg-slate-800 border-slate-600 flex-shrink-0">
                        <TabsTrigger value="email1" className="text-slate-300 text-xs lg:text-sm">Email 1</TabsTrigger>
                        <TabsTrigger value="email2" className="text-slate-300 text-xs lg:text-sm">Email 2</TabsTrigger>
                        <TabsTrigger value="email3" className="text-slate-300 text-xs lg:text-sm">Email 3</TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto mt-4">
                        {[0, 1, 2].map((emailIndex) => {
                          const email = getEmailByIndex(selectedDraft, emailIndex);
                          return (
                            <TabsContent key={`email${emailIndex + 1}`} value={`email${emailIndex + 1}`} className="mt-0">
                              <Card className="bg-slate-800 border-slate-600">
                                <CardHeader className="pb-3">
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                                    <div className="flex-1">
                                      <CardTitle className="text-white text-sm lg:text-base mb-2 leading-tight">
                                        {email.subject}
                                      </CardTitle>
                                      <p className="text-slate-400 text-xs lg:text-sm">
                                        To: {selectedDraft.lead?.email || lead?.email}
                                      </p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs lg:text-sm"
                                        onClick={() => handleEditEmail(emailIndex, email.subject, email.body)}
                                      >
                                        <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs lg:text-sm"
                                        onClick={() => handleCopyEmail(email.subject, email.body)}
                                      >
                                        <Copy className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                                        Copy
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 lg:p-4">
                                    <pre className="text-slate-200 text-xs lg:text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                      {email.body}
                                    </pre>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          );
                        })}
                      </div>
                    </Tabs>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-slate-400">Select a draft to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* Edit Email Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 rounded-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Edit Email Draft</DialogTitle>
          </DialogHeader>
          
          {editingEmail && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300 text-sm">Subject Line</Label>
                <Input
                  value={editingEmail.subject}
                  onChange={(e) => setEditingEmail({...editingEmail, subject: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white text-sm mt-1"
                />
              </div>
              
              <div>
                <Label className="text-slate-300 text-sm">Email Body</Label>
                <Textarea
                  value={editingEmail.body}
                  onChange={(e) => setEditingEmail({...editingEmail, body: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white text-sm min-h-[150px] sm:min-h-[200px] mt-1"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEditedEmail} className="bg-blue-600 hover:bg-blue-700 text-sm w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}