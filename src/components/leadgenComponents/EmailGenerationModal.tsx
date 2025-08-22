'use client';

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Mail, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Lead } from '@/types/leadgen';
import type { EmailGenerationFormData } from '@/types/emailGeneration';
import { generateEmails } from '@/app/lib/services/emailServices/generateEmails';

interface EmailGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onGenerate?: (data: EmailGenerationFormData) => Promise<void>;
}

export default function EmailGenerationModal({
  isOpen,
  onClose,
  leads,
  onGenerate
}: EmailGenerationModalProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<EmailGenerationFormData>>({
    user_comments: '',
    specific_requirements: '',
    tone_preference: 'professional',
    call_to_action: '',
    include_case_study: false,
    include_pricing: false,
    follow_up_sequence: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedLead = leads.find(lead => lead.id === selectedLeadId);

  const handleGenerateEmails = useCallback(async () => {
    if (!selectedLeadId) {
      toast.error('Please select a lead first');
      return;
    }

    if (!formData.user_comments?.trim()) {
      toast.error('Please provide some context or comments');
      return;
    }

    try {
      setIsGenerating(true);

      // SECURITY: Authentication is now handled server-side

      const emailData: EmailGenerationFormData = {
        lead_id: selectedLeadId,
        user_comments: formData.user_comments || '',
        specific_requirements: formData.specific_requirements || '',
        tone_preference: formData.tone_preference || 'professional',
        call_to_action: formData.call_to_action,
        include_case_study: formData.include_case_study,
        include_pricing: formData.include_pricing,
        follow_up_sequence: formData.follow_up_sequence,
      };

      // Call the secure email generation service
      const result = await generateEmails(emailData);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success('Email drafts generated successfully!');
      
      // Call the optional onGenerate callback if provided
      if (onGenerate) {
        await onGenerate(emailData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error generating emails:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate email drafts');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedLeadId, formData, onGenerate, onClose]);

  const handleClose = useCallback(() => {
    if (!isGenerating) {
      setSelectedLeadId('');
      setFormData({
        user_comments: '',
        specific_requirements: '',
        tone_preference: 'professional',
        call_to_action: '',
        include_case_study: false,
        include_pricing: false,
        follow_up_sequence: false,
      });
      onClose();
    }
  }, [isGenerating, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <DialogTitle className="text-xl font-semibold text-white">
                Generate Cold Emails
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isGenerating}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Selection */}
          <div className="space-y-2">
            <Label className="text-slate-300">Select Lead</Label>
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                <SelectValue placeholder="Choose a lead to generate emails for" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lead.first_name} {lead.last_name}</span>
                      <span className="text-slate-400">({lead.company})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Lead Preview */}
          {selectedLead && (
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-300 text-sm">Selected Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Name:</span>
                    <span className="ml-2 text-slate-200">{selectedLead.first_name} {selectedLead.last_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Company:</span>
                    <span className="ml-2 text-slate-200">{selectedLead.company}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Industry:</span>
                    <span className="ml-2 text-slate-200">{selectedLead.industry || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Title:</span>
                    <span className="ml-2 text-slate-200">{selectedLead.job_title || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Generation Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userComments" className="text-slate-300">
                Comments & Context <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="userComments"
                value={formData.user_comments || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, user_comments: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-slate-100"
                placeholder="Provide context about why you're reaching out, specific pain points to address, or any relevant information about this lead..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specificRequirements" className="text-slate-300">
                Specific Requirements
              </Label>
              <Textarea
                id="specificRequirements"
                value={formData.specific_requirements || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, specific_requirements: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-slate-100"
                placeholder="Any specific requirements, meeting requests, or call-to-actions you want included..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Tone Preference</Label>
                <Select 
                  value={formData.tone_preference} 
                  onValueChange={(value: 'professional' | 'casual' | 'urgent' | 'friendly') => 
                    setFormData(prev => ({ ...prev, tone_preference: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="callToAction" className="text-slate-300">
                  Call to Action
                </Label>
                <Input
                  id="callToAction"
                  value={formData.call_to_action || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, call_to_action: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-slate-100"
                  placeholder="e.g., Schedule a call, Book a demo"
                />
              </div>
            </div>

            {/* Email Options */}
            <div className="space-y-3">
              <Label className="text-slate-300">Email Options</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-slate-300">Include Case Study</div>
                  <div className="text-xs text-slate-400">Reference success stories in emails</div>
                </div>
                <Switch
                  checked={formData.include_case_study}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_case_study: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-slate-300">Include Pricing Information</div>
                  <div className="text-xs text-slate-400">Mention pricing or packages</div>
                </div>
                <Switch
                  checked={formData.include_pricing}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_pricing: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-slate-300">Follow-up Sequence</div>
                  <div className="text-xs text-slate-400">Generate follow-up email variations</div>
                </div>
                <Switch
                  checked={formData.follow_up_sequence}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, follow_up_sequence: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateEmails}
              disabled={isGenerating || !selectedLeadId || !formData.user_comments?.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Emails
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}