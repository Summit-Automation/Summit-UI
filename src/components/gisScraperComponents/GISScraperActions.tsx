'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Download, Trash2, Loader2 } from 'lucide-react';
import { GISSearchCriteria, GISProperty } from '@/types/gis-properties';
import { toast } from 'sonner';

interface GISScraperActionsProps {
  criteria: GISSearchCriteria;
  isLoading: boolean;
  results: GISProperty[];
  onCriteriaChange: (field: keyof GISSearchCriteria, value: string | number) => void;
  onScrape: () => void;
  onDownloadCSV?: () => void;
  onCleanupOldData: (force?: boolean) => void;
}

export default function GISScraperActions({ 
  criteria, 
  isLoading, 
  results,
  onCriteriaChange, 
  onScrape, 
  onCleanupOldData 
}: GISScraperActionsProps) {
  const handleDownloadCSV = () => {
    if (results.length === 0) {
      toast.error('No results to download');
      return;
    }

    const headers = ['Owner Name', 'Address', 'City', 'Acreage', 'Assessed Value', 'Property Type', 'Parcel ID'];
    const csvContent = [
      headers.join(','),
      ...results.map(property => [
        `"${property.owner_name}"`,
        `"${property.address}"`,
        `"${property.city}"`,
        property.acreage,
        property.assessed_value || '',
        `"${property.property_type || ''}"`,
        `"${property.parcel_id || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const locationPart = 'lawrence-county';
    a.download = `gis-properties-${locationPart}-${criteria.min_acreage}-${criteria.max_acreage}acres.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV file downloaded successfully');
  };

  return (
    <>
      {/* Search Form */}
      <Card className="card-enhanced" data-appear>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Search for properties across all townships in Lawrence County by acreage range. Results will show 10 random properties with accurate city identification.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_acreage">Minimum Acreage</Label>
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
              <Label htmlFor="max_acreage">Maximum Acreage</Label>
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
          
          <Button 
            onClick={onScrape} 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping Properties...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Properties
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Actions */}
      {results.length > 0 && (
        <Card className="card-enhanced" data-appear>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCleanupOldData(false)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Cleanup Old Data (7+ days)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCleanupOldData(true)}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                title="Clears all search results (saved properties remain in Saved Properties tab)"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Search Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}