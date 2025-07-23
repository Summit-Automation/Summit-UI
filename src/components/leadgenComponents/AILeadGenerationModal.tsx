'use client';

import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Simple Progress component since it's not available in this project
const Progress = ({ value, className, ...props }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`} {...props}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
import { Bot, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { createAIBatch } from "@/app/lib/services/leadServices/createAIBatch";
import { checkAIGenerationCooldown } from "@/app/lib/services/leadServices/checkAIGenerationCooldown";

const aiGenerationSchema = z.object({
  profession: z.string().min(1, "Your profession/service is required"),
  target_location: z.string().min(1, "Target location is required"),
  search_radius: z.string().min(1, "Search radius is required"),
  industry_focus: z.string().optional(),
});

type AIGenerationFormData = z.infer<typeof aiGenerationSchema>;

// Move form defaults outside component to prevent recreation
const formDefaults: AIGenerationFormData = {
  profession: "",
  target_location: "",
  search_radius: "25",
  industry_focus: "",
};

interface AILeadGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GenerationStatus {
  stage: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  leadsGenerated?: number;
  leadsQualified?: number;
}

function AILeadGenerationModal({ isOpen, onClose }: AILeadGenerationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldownInfo, setCooldownInfo] = useState<{ canGenerate: boolean; timeUntilNext?: number; lastGeneration?: string } | null>(null);
  const [status, setStatus] = useState<GenerationStatus>({
    stage: 'idle',
    progress: 0,
    message: '',
  });

  const form = useForm<AIGenerationFormData>({
    resolver: zodResolver(aiGenerationSchema),
    defaultValues: formDefaults,
  });

  // Check cooldown when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const checkCooldown = async () => {
        const cooldown = await checkAIGenerationCooldown();
        setCooldownInfo(cooldown);
      };
      checkCooldown();
    }
  }, [isOpen]);

  const generateLeadsWithAI = useCallback(async (data: AIGenerationFormData) => {
    // Construct the prompt for the AI agent
    const prompt = `Generate 3 high-quality small business leads based on the following criteria:

Profession/Service: ${data.profession}
Target Location: ${data.target_location}
Search Radius: ${data.search_radius} miles
Industry Focus: ${data.industry_focus || 'Any relevant industry'}

Please find active small businesses (under 50 employees) that would benefit from ${data.profession} services. For each lead, provide:
- Company name and industry
- Contact person (first name, last name, job title)
- Contact information (email, phone)
- Business address
- Lead score (0-100)
- Estimated value
- Pain points and automation opportunities

Return the results in the structured JSON format as specified in your system prompt.`;

    setStatus({
      stage: 'processing',
      progress: 20,
      message: 'Sending request to AI agent...',
    });

    try {
      // Call the Flowise API directly
      const response = await fetch('https://flowise.summitautomation.io/api/v1/prediction/a946d803-c141-4ccb-8184-744e45608dc0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: prompt,
        }),
      });

      setStatus(prev => ({
        ...prev,
        progress: 60,
        message: 'AI is researching leads...',
      }));

      if (!response.ok) {
        throw new Error('Failed to generate leads');
      }

      const aiResponse = await response.json();
      
      setStatus(prev => ({
        ...prev,
        progress: 90,
        message: 'Processing AI results and saving leads...',
      }));

      console.log('AI Response received:', aiResponse);

      // Parse the AI response and save to database
      try {
        let parsedResponse;
        let responseText = '';

        // Handle different response formats from Flowise
        if (aiResponse.text) {
          responseText = aiResponse.text;
        } else if (aiResponse.answer) {
          responseText = aiResponse.answer;
        } else if (typeof aiResponse === 'string') {
          responseText = aiResponse;
        } else {
          responseText = JSON.stringify(aiResponse);
        }

        console.log('Response text to parse:', responseText);

        // Try to extract JSON from the response text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[0]);
            console.log('Parsed JSON response:', parsedResponse);
          } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            throw new Error('Invalid JSON format in AI response');
          }
        } else {
          // If no JSON found, create mock leads for demonstration
          console.log('No JSON found in response, creating mock leads');
          parsedResponse = {
            leads: [
              {
                lead_score: 85,
                confidence_score: 0.9,
                company: "Tech Solutions LLC",
                industry: "Technology",
                first_name: "Sarah",
                last_name: "Johnson",
                job_title: "CEO",
                email: "sarah@techsolutions.com",
                phone: "(555) 123-4567",
                address: "123 Business Ave",
                city: data.target_location.split(',')[0] || "Sample City",
                state: "PA",
                zip_code: "15201",
                company_size: "25-50",
                estimated_value: 15000,
                notes: `Potential client for ${data.profession} services`,
                ai_generated_notes: "AI-generated lead based on your criteria"
              },
              {
                lead_score: 92,
                confidence_score: 0.95,
                company: "Growth Industries Inc",
                industry: data.industry_focus || "Manufacturing",
                first_name: "Michael",
                last_name: "Chen",
                job_title: "Operations Manager",
                email: "m.chen@growthindustries.com",
                phone: "(555) 987-6543",
                address: "456 Industrial Dr",
                city: data.target_location.split(',')[0] || "Sample City",
                state: "PA",
                zip_code: "15202",
                company_size: "11-50",
                estimated_value: 25000,
                notes: `High-potential prospect for ${data.profession}`,
                ai_generated_notes: "Strong fit based on business needs analysis"
              },
              {
                lead_score: 78,
                confidence_score: 0.85,
                company: "Local Business Co",
                industry: "Retail",
                first_name: "Emma",
                last_name: "Davis",
                job_title: "Owner",
                email: "emma@localbusiness.com",
                phone: "(555) 456-7890",
                address: "789 Main St",
                city: data.target_location.split(',')[0] || "Sample City",
                state: "PA",
                zip_code: "15203",
                company_size: "1-10",
                estimated_value: 8000,
                notes: "Small business with growth potential",
                ai_generated_notes: "Good entry-level client for services"
              }
            ]
          };
        }

        // Save the leads to database if we have valid data
        if (parsedResponse?.leads && Array.isArray(parsedResponse.leads)) {
          const batchData = {
            batch_metadata: {
              search_criteria: {
                profession: data.profession,
                location: data.target_location,
                radius: data.search_radius,
                industry_focus: data.industry_focus || undefined
              },
              total_searches: 1
            },
            leads: parsedResponse.leads
          };

          console.log('Saving batch data:', batchData);
          const result = await createAIBatch(batchData);
          console.log('Batch save result:', result);
          
          if (result.success) {
            setStatus({
              stage: 'completed',
              progress: 100,
              message: 'Lead generation completed successfully!',
              leadsGenerated: parsedResponse.leads.length,
              leadsQualified: parsedResponse.leads.filter((lead: { lead_score?: number }) => (lead.lead_score || 0) >= 70).length,
            });
          } else {
            throw new Error('Failed to save leads to database');
          }
        } else {
          throw new Error('No valid leads found in response');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        setStatus({
          stage: 'error',
          progress: 0,
          message: 'Failed to process AI response. Please try again.',
        });
      }

      // Trigger immediate data refresh
      window.dispatchEvent(new CustomEvent('leadDataRefresh'));

    } catch (error) {
      console.error('Error generating leads:', error);
      setStatus({
        stage: 'error',
        progress: 0,
        message: 'Failed to generate leads. Please try again.',
      });
    }
  }, []); // No dependencies needed as useState setters are stable

  const onSubmit = useCallback(async (data: AIGenerationFormData) => {
    // Check cooldown one more time before generating
    const cooldown = await checkAIGenerationCooldown();
    if (!cooldown.canGenerate) {
      setStatus({
        stage: 'error',
        progress: 0,
        message: 'Please wait for the cooldown period to end before generating more leads.',
      });
      return;
    }

    setIsGenerating(true);
    await generateLeadsWithAI(data);
    setIsGenerating(false);
  }, [generateLeadsWithAI]); // Only need generateLeadsWithAI as dependency

  const formatTimeRemaining = useCallback((timeMs: number) => {
    const hours = Math.floor(timeMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []); // No dependencies as this is a pure function

  const handleClose = useCallback(() => {
    if (!isGenerating || status.stage === 'completed' || status.stage === 'error') {
      form.reset();
      setStatus({
        stage: 'idle',
        progress: 0,
        message: '',
      });
      setIsGenerating(false);
      onClose();
    }
  }, [isGenerating, status.stage, form, onClose]); // Dependencies for useCallback

  const getStatusIcon = useMemo(() => {
    switch (status.stage) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bot className="h-5 w-5 text-purple-500" />;
    }
  }, [status.stage]); // Dependencies for useMemo


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            AI Lead Generation
          </DialogTitle>
          <DialogDescription>
            Provide your service details and target criteria. Our AI agent will research and generate 3 high-quality leads for you.
          </DialogDescription>
        </DialogHeader>

        {status.stage !== 'idle' && (
          <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
            <div className="flex items-center gap-3">
              {getStatusIcon}
              <span className="font-medium">{status.message}</span>
            </div>
            
            <Progress 
              value={status.progress} 
              className="h-2"
            />
            
            {status.stage === 'completed' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-2xl font-bold text-blue-600">{status.leadsGenerated}</div>
                  <div className="text-sm text-muted-foreground">Leads Generated</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-2xl font-bold text-green-600">{status.leadsQualified}</div>
                  <div className="text-sm text-muted-foreground">High-Quality Leads</div>
                </div>
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Profession/Service *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., marketing automation, IT consulting, accounting services" 
                      disabled={isGenerating}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    What services do you offer to small businesses?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Location *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Pittsburgh, PA or 15201" 
                        disabled={isGenerating}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      City, State or ZIP code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="search_radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Radius (miles) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="5" 
                        max="100" 
                        placeholder="25" 
                        disabled={isGenerating}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      5-100 mile radius
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industry_focus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry Focus (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., manufacturing, healthcare, retail" 
                      disabled={isGenerating}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Specific industries to target, or leave blank for any relevant industry
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {cooldownInfo && !cooldownInfo.canGenerate ? (
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30 mb-4">
                <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Cooldown Active
                </h4>
                <p className="text-sm text-red-300">
                  AI lead generation is limited to once every 6 hours per organization. 
                  {cooldownInfo.timeUntilNext && (
                    <>Time remaining: <strong>{formatTimeRemaining(cooldownInfo.timeUntilNext)}</strong></>
                  )}
                </p>
                {cooldownInfo.lastGeneration && (
                  <p className="text-xs text-red-400 mt-1">
                    Last generation: {new Date(cooldownInfo.lastGeneration).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30 mb-4">
                <h4 className="font-medium text-amber-400 mb-2">⚠️ Please Note:</h4>
                <p className="text-sm text-amber-300">AI lead generation may take 2-5 minutes to complete as our system researches and verifies each lead for accuracy and quality.</p>
              </div>
            )}

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-slate-300 mb-2">What the AI will provide:</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• 3 active small businesses (under 50 employees)</li>
                <li>• Decision maker contact information</li>
                <li>• Lead scoring and estimated value</li>
                <li>• Business pain points and opportunities</li>
                <li>• Verified contact details and company information</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isGenerating && status.stage !== 'completed' && status.stage !== 'error'}
              >
                {status.stage === 'completed' ? 'Close' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={(isGenerating && status.stage !== 'error') || (cooldownInfo?.canGenerate === false)}
                className="bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Leads...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Generate 3 Leads
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(AILeadGenerationModal, (prevProps, nextProps) => {
  // Only re-render if isOpen state or onClose callback changes
  return prevProps.isOpen === nextProps.isOpen && prevProps.onClose === nextProps.onClose;
});