'use client';

import React, { useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw } from "lucide-react";
import { LEAD_STATUSES, LEAD_PRIORITIES, COMPANY_SIZES } from "@/types/leadgen";

export interface LeadFilters {
  status?: string;
  priority?: string;
  source?: 'manual' | 'ai_agent';
  company_size?: string;
  is_qualified?: boolean;
  min_score?: number;
  max_score?: number;
  min_estimated_value?: number;
  max_estimated_value?: number;
  industry?: string;
  city?: string;
  state?: string;
  search_term?: string;
  date_from?: string;
  date_to?: string;
}

const filterSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  source: z.string().optional(),
  company_size: z.string().optional(),
  is_qualified: z.string().optional(),
  min_score: z.string().optional(),
  max_score: z.string().optional(),
  min_estimated_value: z.string().optional(),
  max_estimated_value: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  search_term: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface FilterLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: LeadFilters) => void;
  currentFilters: LeadFilters;
}

export default function FilterLeadsModal({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}: FilterLeadsModalProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: currentFilters.status,
      priority: currentFilters.priority,
      source: currentFilters.source,
      company_size: currentFilters.company_size,
      is_qualified: currentFilters.is_qualified === true ? 'yes' : currentFilters.is_qualified === false ? 'no' : undefined,
      min_score: currentFilters.min_score?.toString() || "",
      max_score: currentFilters.max_score?.toString() || "",
      min_estimated_value: currentFilters.min_estimated_value?.toString() || "",
      max_estimated_value: currentFilters.max_estimated_value?.toString() || "",
      industry: currentFilters.industry || "",
      city: currentFilters.city || "",
      state: currentFilters.state || "",
      search_term: currentFilters.search_term || "",
      date_from: currentFilters.date_from || "",
      date_to: currentFilters.date_to || "",
    },
  });

  // Update active filters when form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      const active = Object.entries(value)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([key]) => key);
      setActiveFilters(active);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: FilterFormData) => {
    const filters: LeadFilters = {};
    
    // Convert form data to proper filter format
    if (data.status) filters.status = data.status;
    if (data.priority) filters.priority = data.priority;
    if (data.source && (data.source === 'manual' || data.source === 'ai_agent')) {
      filters.source = data.source as 'manual' | 'ai_agent';
    }
    if (data.company_size) filters.company_size = data.company_size;
    if (data.is_qualified) {
      filters.is_qualified = data.is_qualified === 'yes';
    }
    if (data.min_score && data.min_score !== "") filters.min_score = parseInt(data.min_score);
    if (data.max_score && data.max_score !== "") filters.max_score = parseInt(data.max_score);
    if (data.min_estimated_value && data.min_estimated_value !== "") {
      filters.min_estimated_value = parseFloat(data.min_estimated_value);
    }
    if (data.max_estimated_value && data.max_estimated_value !== "") {
      filters.max_estimated_value = parseFloat(data.max_estimated_value);
    }
    if (data.industry && data.industry !== "") filters.industry = data.industry;
    if (data.city && data.city !== "") filters.city = data.city;
    if (data.state && data.state !== "") filters.state = data.state;
    if (data.search_term && data.search_term !== "") filters.search_term = data.search_term;
    if (data.date_from && data.date_from !== "") filters.date_from = data.date_from;
    if (data.date_to && data.date_to !== "") filters.date_to = data.date_to;

    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    form.reset({
      status: undefined,
      priority: undefined,
      source: undefined,
      company_size: undefined,
      is_qualified: undefined,
      min_score: "",
      max_score: "",
      min_estimated_value: "",
      max_estimated_value: "",
      industry: "",
      city: "",
      state: "",
      search_term: "",
      date_from: "",
      date_to: "",
    });
    onApplyFilters({});
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Filter className="h-5 w-5" />
            Filter Leads
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Apply filters to find specific leads. Leave fields empty to ignore that filter.
          </DialogDescription>
        </DialogHeader>

        {activeFilters.length > 0 && (
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-300">Active Filters:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="text-xs">
                  {filter.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Search Term */}
            <FormField
              control={form.control}
              name="search_term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Search Term</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Search in name, company, email..." 
                      className="bg-slate-900 border-slate-700 text-slate-50" 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {LEAD_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">
                            {String(status).replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Any priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {LEAD_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority} className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">
                            {String(priority).toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Any source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="manual" className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">Manual Entry</SelectItem>
                        <SelectItem value="ai_agent" className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">AI Generated</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Company Size and Qualification Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Company Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Any size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size} className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">
                            {String(size)} employees
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_qualified"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Qualified</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50">
                          <SelectValue placeholder="Any qualification" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="yes" className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">Qualified</SelectItem>
                        <SelectItem value="no" className="text-slate-50 focus:bg-slate-800 focus:text-slate-50">Not Qualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Score Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Minimum Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="0"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Maximum Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="100"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Estimated Value Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_estimated_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Min Estimated Value ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_estimated_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Max Estimated Value ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="No limit"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Industry</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Technology"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Pittsburgh"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">State</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., PA"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Created From</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Created To</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        className="bg-slate-900 border-slate-700 text-slate-50" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}