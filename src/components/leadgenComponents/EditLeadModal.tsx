'use client';

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { LEAD_STATUSES, LEAD_PRIORITIES, COMPANY_SIZES, Lead } from "@/types/leadgen";
import { updateLeadEntry } from "@/app/lib/services/leadServices/updateLeadEntry";

const leadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(LEAD_PRIORITIES),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string(),
  estimated_value: z.string().optional(),
  expected_close_date: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.enum(COMPANY_SIZES).optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export default function EditLeadModal({ isOpen, onClose, lead }: EditLeadModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      job_title: "",
      status: "new",
      priority: "medium",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "US",
      estimated_value: "",
      expected_close_date: "",
      industry: "",
      notes: "",
      tags: "",
    },
  });

  // Populate form when lead changes
  useEffect(() => {
    if (lead && isOpen) {
      form.reset({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        job_title: lead.job_title || "",
        status: lead.status as typeof LEAD_STATUSES[number],
        priority: lead.priority as typeof LEAD_PRIORITIES[number],
        address: lead.address || "",
        city: lead.city || "",
        state: lead.state || "",
        zip_code: lead.zip_code || "",
        country: lead.country || "US",
        estimated_value: lead.estimated_value ? lead.estimated_value.toString() : "",
        expected_close_date: lead.expected_close_date || "",
        industry: lead.industry || "",
        notes: lead.notes || "",
        tags: "",
      });
      setTags(lead.tags || []);
    }
  }, [lead, isOpen, form]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: LeadFormData) => {
    if (!lead) return;
    
    setIsLoading(true);
    try {
      const leadData = {
        ...data,
        estimated_value: data.estimated_value ? parseFloat(data.estimated_value) : undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      const success = await updateLeadEntry(lead.id, leadData);
      
      if (success) {
        form.reset();
        setTags([]);
        setTagInput("");
        onClose();
        router.refresh();
        // Trigger refresh event
        window.dispatchEvent(new CustomEvent('leadDataRefresh'));
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setTags([]);
    setTagInput("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Lead</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the lead information and details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@company.com" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Director" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {LEAD_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">
                            {status.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {LEAD_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority} className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">
                            {priority.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Company Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size} className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">
                            {size} employees
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimated_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Estimated Value ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="10000" type="number" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_close_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Expected Close Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Technology, Healthcare, etc." className="bg-slate-900 border-slate-700 text-slate-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-slate-300">Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  className="bg-slate-900 border-slate-700 text-slate-50"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this lead..."
                      className="resize-none bg-slate-900 border-slate-700 text-slate-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
              >
                {isLoading ? "Updating..." : "Update Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}