'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Filter, 
  X, 
  Search,
  RotateCcw,
  Bookmark,
  History
} from 'lucide-react';
import { GISSearchCriteria } from '@/types/gis-properties';

interface AdvancedSearchFiltersProps {
  criteria: GISSearchCriteria;
  onCriteriaChange: (field: keyof GISSearchCriteria, value: string | number | boolean | string[] | undefined) => void;
  onSearch: () => void;
  isLoading: boolean;
  onSaveTemplate?: (name: string) => void;
  onLoadTemplate?: (templateId: string) => void;
  recentSearches?: GISSearchCriteria[];
  searchTemplates?: { id: string; name: string; criteria: GISSearchCriteria }[];
}

const TOWNSHIP_OPTIONS = [
  'All Townships',
  'New Castle',
  'Scott',
  'Slippery Rock', 
  'Ellwood City',
  'Wilmington',
  'Grove City',
  'Pulaski',
  'New Beaver',
  'Mahoning',
  'Neshannock',
  'Union',
  'Taylor',
  'Hickory',
  'Shenango',
  'Wayne',
  'Perry',
  'Washington',
  'Plain Grove',
  'Little Beaver',
  'North Beaver',
  'Bessemer'
];

const PROPERTY_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Agricultural',
  'Vacant Land',
  'Multi-Family',
  'Mixed Use'
];

export default function AdvancedSearchFilters({
  criteria,
  onCriteriaChange,
  onSearch,
  isLoading,
  onSaveTemplate,
  onLoadTemplate,
  recentSearches = [],
  searchTemplates = []
}: AdvancedSearchFiltersProps) {
  const [templateName, setTemplateName] = useState('');
  const [showTemplateInput, setShowTemplateInput] = useState(false);

  const handlePropertyTypeChange = (propertyType: string, checked: boolean) => {
    const currentTypes = criteria.property_types || [];
    if (checked) {
      onCriteriaChange('property_types', [...currentTypes, propertyType]);
    } else {
      onCriteriaChange('property_types', currentTypes.filter(t => t !== propertyType));
    }
  };

  const clearFilter = (field: keyof GISSearchCriteria) => {
    onCriteriaChange(field, undefined);
  };

  const resetAllFilters = () => {
    onCriteriaChange('min_acreage', 10);
    onCriteriaChange('max_acreage', 20);
    onCriteriaChange('township', undefined);
    onCriteriaChange('min_assessed_value', undefined);
    onCriteriaChange('max_assessed_value', undefined);
    onCriteriaChange('property_types', []);
    onCriteriaChange('exclude_exported', false);
    onCriteriaChange('sort_by', 'scraped_at');
    onCriteriaChange('sort_order', 'desc');
  };

  const saveTemplate = () => {
    if (templateName.trim() && onSaveTemplate) {
      onSaveTemplate(templateName.trim());
      setTemplateName('');
      setShowTemplateInput(false);
    }
  };

  const activeFiltersCount = [
    criteria.township,
    criteria.min_assessed_value,
    criteria.max_assessed_value,
    criteria.property_types?.length,
    criteria.exclude_exported
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4" data-appear>
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold">Advanced Search Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllFilters}
            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="township">Township/City</Label>
            <Select
              value={criteria.township || 'All Townships'}
              onValueChange={(value) => onCriteriaChange('township', value === 'All Townships' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select township" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
                {TOWNSHIP_OPTIONS.map(township => (
                  <SelectItem 
                    key={township} 
                    value={township}
                    className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none"
                  >
                    {township}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_acreage">Min Acreage</Label>
            <Input
              id="min_acreage"
              type="number"
              min="0"
              step="0.1"
              value={criteria.min_acreage}
              onChange={(e) => onCriteriaChange('min_acreage', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_acreage">Max Acreage</Label>
            <Input
              id="max_acreage"
              type="number"
              min="0"
              step="0.1"
              value={criteria.max_acreage}
              onChange={(e) => onCriteriaChange('max_acreage', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Advanced Filters - Always Visible */}
        <div className="space-y-4">
            {/* Assessed Value Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_assessed_value">Min Assessed Value ($)</Label>
                <div className="relative">
                  <Input
                    id="min_assessed_value"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g., 50000"
                    value={criteria.min_assessed_value || ''}
                    onChange={(e) => onCriteriaChange('min_assessed_value', parseFloat(e.target.value) || undefined)}
                  />
                  {criteria.min_assessed_value && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('min_assessed_value')}
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_assessed_value">Max Assessed Value ($)</Label>
                <div className="relative">
                  <Input
                    id="max_assessed_value"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g., 500000"
                    value={criteria.max_assessed_value || ''}
                    onChange={(e) => onCriteriaChange('max_assessed_value', parseFloat(e.target.value) || undefined)}
                  />
                  {criteria.max_assessed_value && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('max_assessed_value')}
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Property Types</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <div key={type} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Checkbox
                      id={type}
                      checked={criteria.property_types?.includes(type) || false}
                      onCheckedChange={(checked) => handlePropertyTypeChange(type, checked as boolean)}
                    />
                    <Label htmlFor={type} className="text-sm font-medium cursor-pointer select-none">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {criteria.property_types && criteria.property_types.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Selected:</span>
                  <div className="flex flex-wrap gap-1">
                    {criteria.property_types.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePropertyTypeChange(type, false)}
                          className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* Options */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Switch
                id="exclude_exported"
                checked={criteria.exclude_exported || false}
                onCheckedChange={(checked) => onCriteriaChange('exclude_exported', checked)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="exclude_exported" className="text-sm font-medium cursor-pointer">
                  Exclude already exported properties
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hide properties that have already been exported to CRM
                </p>
              </div>
            </div>

            {/* Sorting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={criteria.sort_by || 'scraped_at'}
                  onValueChange={(value) => onCriteriaChange('sort_by', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md">
                    <SelectItem value="scraped_at" className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none">Date Scraped</SelectItem>
                    <SelectItem value="acreage" className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none">Acreage</SelectItem>
                    <SelectItem value="assessed_value" className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none">Assessed Value</SelectItem>
                    <SelectItem value="address" className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none">Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select
                  value={criteria.sort_order || 'desc'}
                  onValueChange={(value) => onCriteriaChange('sort_order', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md">
                    <SelectItem value="desc" className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none">Descending</SelectItem>
                    <SelectItem value="asc" className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
        </div>

        {/* Search Templates & History */}
        {(searchTemplates.length > 0 || recentSearches.length > 0) && (
          <div className="border-t pt-4 space-y-4">
            {/* Search Templates */}
            {searchTemplates.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Saved Templates
                </Label>
                <div className="flex flex-wrap gap-2">
                  {searchTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadTemplate && onLoadTemplate(template.id)}
                      className="text-xs"
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Searches
                </Label>
                <div className="space-y-2">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        Object.keys(search).forEach(key => {
                          onCriteriaChange(key as keyof GISSearchCriteria, search[key as keyof GISSearchCriteria]);
                        });
                      }}
                      className="text-xs justify-start w-full"
                    >
                      {search.township || 'All'} • {search.min_acreage}-{search.max_acreage} acres
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            onClick={onSearch} 
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Properties
              </>
            )}
          </Button>

          {onSaveTemplate && (
            <div className="w-full">
              {showTemplateInput ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Template name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 h-9"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={saveTemplate} 
                      size="sm" 
                      disabled={!templateName.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white h-9"
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowTemplateInput(false);
                        setTemplateName('');
                      }}
                      className="h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateInput(true)}
                  className="w-full h-9"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}