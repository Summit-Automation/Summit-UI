'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { History } from 'lucide-react';
import { GISProperty, GISSearchCriteria } from '@/types/gis-properties';
import GISScraperActions from './GISScraperActions';
import GISPropertyTable from './GISPropertyTable';
import GISScraperSummary from './GISScraperSummary';

export default function GISScraperContent() {
  const [criteria, setCriteria] = useState<GISSearchCriteria>({
    min_acreage: 10,
    max_acreage: 20
  });
  const [results, setResults] = useState<GISProperty[]>([]);
  const [savedProperties, setSavedProperties] = useState<GISProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    loadSavedProperties();
    loadRecentScrapedProperties();
  }, []);

  const loadRecentScrapedProperties = async () => {
    try {
      const response = await fetch('/api/gis-scraper/properties?type=scraped');
      if (response.ok) {
        const data = await response.json();
        // Load recent scraped properties (they're ordered by scraped_at DESC)
        if (data.properties && data.properties.length > 0) {
          setResults(data.properties);
        } else {
          // Clear results if no scraped properties exist
          setResults([]);
        }
      } else {
        console.error('Failed to load scraped properties:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading scraped properties:', error);
    }
  };

  const loadSavedProperties = async () => {
    try {
      const response = await fetch('/api/gis-scraper/properties?type=saved');
      if (response.ok) {
        const data = await response.json();
        setSavedProperties(data.properties || []);
      } else {
        console.error('Failed to load saved properties:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading saved properties:', error);
    }
  };

  const handleInputChange = (field: keyof GISSearchCriteria, value: string | number) => {
    setCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScrape = async () => {
    if (criteria.min_acreage <= 0 || criteria.max_acreage <= 0) {
      toast.error('Acreage values must be greater than 0');
      return;
    }

    if (criteria.min_acreage > criteria.max_acreage) {
      toast.error('Minimum acreage cannot be greater than maximum acreage');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/gis-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape GIS data');
      }

      const data = await response.json();
      setResults(data.properties || []);
      
      if (data.properties && data.properties.length > 0) {
        toast.success(`Found ${data.properties.length} properties matching your criteria`);
        // Switch to results tab
        setActiveTab('search');
        // Reload saved properties to include new ones
        loadSavedProperties();
      } else {
        toast.info('No properties found matching your criteria');
      }
    } catch (error) {
      console.error('Error scraping GIS data:', error);
      toast.error('Failed to scrape GIS data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportProperty = async (propertyId: string) => {
    setExportingIds(prev => new Set(prev).add(propertyId));
    
    try {
      const response = await fetch('/api/gis-scraper/export-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ savedPropertyId: propertyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to export lead');
      }

      const data = await response.json();
      toast.success(data.message);
      
      // Update the property in both results and saved properties
      const updateProperty = (property: GISProperty) => 
        property.id === propertyId 
          ? { ...property, exported_to_leads: true, exported_at: new Date().toISOString() }
          : property;
      
      setResults(prev => prev.map(updateProperty));
      setSavedProperties(prev => prev.map(updateProperty));
      
    } catch (error) {
      console.error('Error exporting lead:', error);
      toast.error('Failed to export lead. Please try again.');
    } finally {
      setExportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  };

  const handleCleanupOldData = async (force = false) => {
    try {
      const url = force ? '/api/gis-scraper/cleanup?force=true' : '/api/gis-scraper/cleanup';
      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cleanup data');
      }

      const data = await response.json();
      if (data.deleted_count > 0) {
        toast.success(`Cleaned up ${data.deleted_count} old properties`);
      } else {
        toast.info('No old properties found to cleanup');
      }
      // Clear current results and reload scraped properties after cleanup
      setResults([]);
      loadRecentScrapedProperties();
    } catch (error) {
      console.error('Error cleaning up data:', error);
      toast.error('Failed to cleanup old data');
    }
  };

  const handleDeleteSavedProperty = async (savedPropertyId: string) => {
    try {
      const response = await fetch('/api/gis-scraper/delete-saved-property', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ savedPropertyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      toast.success('Property deleted successfully');
      loadSavedProperties(); // Reload saved properties
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleSaveProperty = async (property: GISProperty) => {
    // Generate a temporary ID for tracking saving state
    const tempId = `${property.owner_name}-${property.address}`.replace(/\s+/g, '-');
    
    setSavingIds(prev => new Set(prev).add(tempId));
    
    try {
      const response = await fetch('/api/gis-scraper/save-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scrapedPropertyId: property.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      toast.success('Property saved successfully');
      loadSavedProperties(); // Reload saved properties
      loadRecentScrapedProperties(); // Reload scraped properties to show updated status
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    }
  };

  return (
    <>
      <GISScraperSummary 
        recentResults={results}
        savedProperties={savedProperties}
      />
      
      <div className="card-enhanced" data-appear>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <span>Search & Results</span>
              {results.length > 0 && (
                <Badge variant="secondary">
                  {results.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <span>Saved Properties</span>
              <Badge variant="secondary">
                {savedProperties.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="search" className="space-y-6">
          <GISScraperActions
            criteria={criteria}
            isLoading={isLoading}
            results={results}
            onCriteriaChange={handleInputChange}
            onScrape={handleScrape}
            onDownloadCSV={() => {}} // Handled internally by GISScraperActions
            onCleanupOldData={(force) => handleCleanupOldData(force)}
          />

          {/* Results */}
          {results.length > 0 && (
            <GISPropertyTable 
              properties={results} 
              actionType="save"
              exportingIds={exportingIds}
              savingIds={savingIds}
              onExportProperty={handleExportProperty}
              onSaveProperty={handleSaveProperty}
              onDeleteProperty={handleDeleteSavedProperty}
            />
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {savedProperties.length > 0 ? (
            <GISPropertyTable 
              properties={savedProperties} 
              actionType="delete"
              exportingIds={exportingIds}
              savingIds={savingIds}
              onExportProperty={handleExportProperty}
              onSaveProperty={handleSaveProperty}
              onDeleteProperty={handleDeleteSavedProperty}
            />
          ) : (
            <Card className="card-enhanced" data-appear>
              <CardContent className="text-center py-12">
                <History className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No saved properties yet</h3>
                <p className="text-muted-foreground">Use the search tab to find and save properties</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </>
  );
}