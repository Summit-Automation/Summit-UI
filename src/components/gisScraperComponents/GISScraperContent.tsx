'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { History, BarChart3, Filter, Users } from 'lucide-react';
import { GISProperty, GISSearchCriteria } from '@/types/gis-properties';
import GISScraperActions from './GISScraperActions';
import GISPropertyTable from './GISPropertyTable';
import GISScraperSummary from './GISScraperSummary';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import PropertyAnalytics from './PropertyAnalytics';
import BatchOperations from './BatchOperations';
import EnhancedExportOptions from './EnhancedExportOptions';
import SearchHistoryTemplates from './SearchHistoryTemplates';

export default function GISScraperContent() {
  const [criteria, setCriteria] = useState<GISSearchCriteria>({
    min_acreage: 10,
    max_acreage: 20,
    sort_by: 'scraped_at',
    sort_order: 'desc'
  });
  const [results, setResults] = useState<GISProperty[]>([]);
  const [savedProperties, setSavedProperties] = useState<GISProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleInputChange = (field: keyof GISSearchCriteria, value: string | number | boolean | string[] | undefined) => {
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
    if (!propertyId) {
      toast.error('Cannot export property: Property ID is missing');
      return;
    }
    
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export lead');
      }

      const data = await response.json();
      toast.success(data.message || 'Property exported to CRM successfully');
      
      // Update the property in both results and saved properties
      const updateProperty = (property: GISProperty) => 
        property.id === propertyId 
          ? { ...property, exported_to_leads: true, exported_at: new Date().toISOString() }
          : property;
      
      setResults(prev => prev.map(updateProperty));
      setSavedProperties(prev => prev.map(updateProperty));
      
    } catch (error) {
      console.error('Error exporting lead:', error);
      toast.error(`Failed to export lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    if (!property.id) {
      toast.error('Cannot save property: Property ID is missing');
      return;
    }
    
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save property');
      }

      toast.success('Property saved successfully');
      loadSavedProperties(); // Reload saved properties
      loadRecentScrapedProperties(); // Reload scraped properties to show updated status
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(`Failed to save property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    }
  };

  // New handlers for enhanced features
  const handleBatchExport = async (ids: string[]) => {
    for (const id of ids) {
      await handleExportProperty(id);
    }
  };

  const handleBatchSave = async (ids: string[]) => {
    for (const id of ids) {
      const property = results.find(p => p.id === id);
      if (property) {
        await handleSaveProperty(property);
      }
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    for (const id of ids) {
      await handleDeleteSavedProperty(id);
    }
  };

  const handleAdvancedSearch = () => {
    handleScrape();
  };

  const handleLoadSearchCriteria = (newCriteria: GISSearchCriteria) => {
    setCriteria(newCriteria);
  };

  const handleRunSearch = (searchCriteria: GISSearchCriteria) => {
    setCriteria(searchCriteria);
    setTimeout(handleScrape, 100); // Small delay to ensure state update
  };

  return (
    <>
      <GISScraperSummary 
        recentResults={results}
        savedProperties={savedProperties}
      />
      
      <div className="w-full max-w-none p-2 sm:p-4 space-y-4" data-appear>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 w-full">
              <TabsTrigger 
                value="search" 
                className="h-10 px-2 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1 truncate">
                  <span>Search</span>
                  {results.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px] min-w-0">
                      {results.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="h-10 px-2 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1 truncate">
                  <span>Saved</span>
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] min-w-0">
                    {savedProperties.length}
                  </Badge>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="h-10 px-2 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1 truncate">
                  <BarChart3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="batch" 
                className="h-10 px-2 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1 truncate">
                  <Users className="h-3 w-3" />
                  <span className="hidden sm:inline">Batch</span>
                  <span className="sm:hidden">Bulk</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="h-10 px-2 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1 truncate">
                  <History className="h-3 w-3" />
                  <span>History</span>
                </div>
              </TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="search" className="space-y-4 sm:space-y-6">
            {/* Controls Section */}
            <div className="space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant={showAdvancedFilters ? "default" : "outline"}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-10 px-4 text-sm font-medium"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                
                {(results.length > 0 || savedProperties.length > 0) && (
                  <Button
                    variant="outline"
                    onClick={() => setShowExportModal(true)}
                    className="h-10 px-4 text-sm font-medium"
                  >
                    Enhanced Export
                  </Button>
                )}
              </div>
            </div>

            {/* Search Interface */}
            {showAdvancedFilters ? (
              <AdvancedSearchFilters
                criteria={criteria}
                onCriteriaChange={handleInputChange}
                onSearch={handleAdvancedSearch}
                isLoading={isLoading}
              />
            ) : (
              <GISScraperActions
                criteria={criteria}
                isLoading={isLoading}
                results={results}
                onCriteriaChange={handleInputChange}
                onScrape={handleScrape}
                onDownloadCSV={() => {}}
                onCleanupOldData={(force) => handleCleanupOldData(force)}
              />
            )}

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

          <TabsContent value="analytics" className="space-y-6">
            <PropertyAnalytics
              properties={results}
              savedProperties={savedProperties}
            />
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <BatchOperations
              properties={activeTab === 'search' ? results : savedProperties}
              selectedIds={selectedPropertyIds}
              onSelectionChange={setSelectedPropertyIds}
              onBatchExport={handleBatchExport}
              onBatchSave={handleBatchSave}
              onBatchDelete={handleBatchDelete}
            />
          </TabsContent>


          <TabsContent value="history" className="space-y-6">
            <SearchHistoryTemplates
              currentCriteria={criteria}
              onLoadCriteria={handleLoadSearchCriteria}
              onRunSearch={handleRunSearch}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-auto shadow-xl border border-slate-200 dark:border-slate-700">
            <EnhancedExportOptions
              properties={results.length > 0 ? results : savedProperties}
              selectedProperties={selectedPropertyIds.size > 0 
                ? [...results, ...savedProperties].filter(p => selectedPropertyIds.has(p.id))
                : undefined
              }
              onExport={(format, options) => {
                console.log('Export:', format, options);
                toast.success(`Export initiated in ${format} format`);
              }}
              onClose={() => setShowExportModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}