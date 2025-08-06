'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  Bookmark, 
  Star, 
  Clock, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  Copy,
  Play,
  Save,
  TrendingUp,
  Download,
  Info
} from 'lucide-react';
import { GISSearchCriteria, SearchTemplate, SearchHistory } from '@/types/gis-properties';
import { toast } from 'sonner';

interface SearchHistoryTemplatesProps {
  currentCriteria: GISSearchCriteria;
  onLoadCriteria: (criteria: GISSearchCriteria) => void;
  onRunSearch: (criteria: GISSearchCriteria) => void;
  className?: string;
}

export default function SearchHistoryTemplates({
  currentCriteria,
  onLoadCriteria,
  onRunSearch,
  className
}: SearchHistoryTemplatesProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [searchTemplates, setSearchTemplates] = useState<SearchTemplate[]>([]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<SearchTemplate | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadSearchHistory();
    loadSearchTemplates();
  }, []);

  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem('gis-search-history');
      if (stored) {
        const history = JSON.parse(stored);
        setSearchHistory(history.slice(0, 20)); // Keep only last 20 searches
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const loadSearchTemplates = () => {
    try {
      const stored = localStorage.getItem('gis-search-templates');
      if (stored) {
        setSearchTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load search templates:', error);
    }
  };


  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Template name is required');
      return;
    }

    const template: SearchTemplate = {
      id: editingTemplate?.id || `template-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim(),
      criteria: currentCriteria,
      is_favorite: editingTemplate?.is_favorite || false,
      created_at: editingTemplate?.created_at || new Date().toISOString(),
      last_used: new Date().toISOString(),
      use_count: editingTemplate?.use_count || 0
    };

    const updatedTemplates = editingTemplate 
      ? searchTemplates.map(t => t.id === editingTemplate.id ? template : t)
      : [...searchTemplates, template];

    setSearchTemplates(updatedTemplates);
    
    try {
      localStorage.setItem('gis-search-templates', JSON.stringify(updatedTemplates));
      toast.success(editingTemplate ? 'Template updated' : 'Template saved');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }

    // Reset form
    setIsCreatingTemplate(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = searchTemplates.filter(t => t.id !== templateId);
    setSearchTemplates(updatedTemplates);
    
    try {
      localStorage.setItem('gis-search-templates', JSON.stringify(updatedTemplates));
      toast.success('Template deleted');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const toggleFavorite = (templateId: string) => {
    const updatedTemplates = searchTemplates.map(template =>
      template.id === templateId 
        ? { ...template, is_favorite: !template.is_favorite }
        : template
    );
    setSearchTemplates(updatedTemplates);
    
    try {
      localStorage.setItem('gis-search-templates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const loadTemplate = (template: SearchTemplate) => {
    const updatedTemplate = {
      ...template,
      last_used: new Date().toISOString(),
      use_count: template.use_count + 1
    };

    const updatedTemplates = searchTemplates.map(t => 
      t.id === template.id ? updatedTemplate : t
    );
    setSearchTemplates(updatedTemplates);
    
    try {
      localStorage.setItem('gis-search-templates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Failed to update template:', error);
    }

    onLoadCriteria(template.criteria);
    toast.success(`Loaded template: ${template.name}`);
  };

  const runTemplateSearch = (template: SearchTemplate) => {
    loadTemplate(template);
    onRunSearch(template.criteria);
  };

  const formatCriteriaDescription = (criteria: GISSearchCriteria): string => {
    const parts = [];
    
    if (criteria.township) parts.push(`${criteria.township}`);
    parts.push(`${criteria.min_acreage}-${criteria.max_acreage} acres`);
    
    if (criteria.min_assessed_value || criteria.max_assessed_value) {
      const min = criteria.min_assessed_value ? `$${criteria.min_assessed_value.toLocaleString()}` : '$0';
      const max = criteria.max_assessed_value ? `$${criteria.max_assessed_value.toLocaleString()}` : '∞';
      parts.push(`${min}-${max}`);
    }
    
    if (criteria.property_types && criteria.property_types.length > 0) {
      parts.push(`Types: ${criteria.property_types.join(', ')}`);
    }
    
    return parts.join(' • ');
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('gis-search-history');
      toast.success('Search history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear history');
    }
  };

  const exportTemplates = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      templates: searchTemplates
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gis-search-templates-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Templates exported');
  };

  // Sort templates by favorites first, then by last used
  const sortedTemplates = [...searchTemplates].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
  });

  // Sort history by search date (newest first)
  const sortedHistory = [...searchHistory].sort((a, b) => 
    new Date(b.searched_at).getTime() - new Date(a.searched_at).getTime()
  );

  return (
    <div className={`w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 ${className}`} data-appear>
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <History className="h-5 w-5" />
        <h3 className="text-lg font-semibold flex-1">Search History & Templates</h3>
        <div className="flex items-center gap-2">
          {searchTemplates.length > 0 && (
            <Badge variant="secondary">
              {searchTemplates.filter(t => t.is_favorite).length} favorites
            </Badge>
          )}
          <Badge variant="outline">
            {searchHistory.length} searches
          </Badge>
        </div>
      </div>
      <Tabs defaultValue="templates" className="w-full space-y-4">
        <TabsList className="w-full h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-2 gap-1 w-full">
            <TabsTrigger 
              value="templates"
              className="h-9 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
            >
              <span className="hidden sm:inline">Templates ({searchTemplates.length})</span>
              <span className="sm:hidden">Templates</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="h-9 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
            >
              <span className="hidden sm:inline">History ({searchHistory.length})</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </div>
        </TabsList>

          <TabsContent value="templates" className="space-y-6 mt-6">
            {/* Create/Edit Template Form */}
            {(isCreatingTemplate || editingTemplate) && (
              <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4 rounded-lg space-y-4">
                <h4 className="text-lg font-semibold">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h4>
                  <div className="space-y-2">
                    <Label htmlFor="template_name">Template Name</Label>
                    <Input
                      id="template_name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Large Rural Properties, High-Value Residential..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template_description">Description (Optional)</Label>
                    <Textarea
                      id="template_description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Describe what this search template is for..."
                      rows={2}
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Current search criteria will be saved: {formatCriteriaDescription(currentCriteria)}
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button onClick={saveTemplate} disabled={!templateName.trim()}>
                      <Save className="mr-2 h-4 w-4" />
                      {editingTemplate ? 'Update Template' : 'Save Template'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreatingTemplate(false);
                        setEditingTemplate(null);
                        setTemplateName('');
                        setTemplateDescription('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
              </div>
            )}

            {/* Templates List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Saved Templates</h4>
                <div className="flex gap-2">
                  {searchTemplates.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportTemplates}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setIsCreatingTemplate(true)}
                    disabled={isCreatingTemplate || editingTemplate !== null}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                  </Button>
                </div>
              </div>

              {sortedTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved templates yet</p>
                  <p className="text-sm">Create templates to quickly run common searches</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedTemplates.map(template => (
                    <div key={template.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{template.name}</h5>
                            {template.is_favorite && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(template.id)}
                            title={template.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`h-4 w-4 ${template.is_favorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template);
                              setTemplateName(template.name);
                              setTemplateDescription(template.description || '');
                            }}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            title="Delete template"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatCriteriaDescription(template.criteria)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Used {template.use_count} times
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(template.last_used).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTemplate(template)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Load
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => runTemplateSearch(template)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Run Search
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Recent Searches</h4>
                {searchHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear History
                  </Button>
                )}
              </div>

              {sortedHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No search history yet</p>
                  <p className="text-sm">Your recent searches will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedHistory.map(historyItem => (
                    <div key={historyItem.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(historyItem.searched_at).toLocaleString()}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {historyItem.results_count} results
                        </Badge>
                      </div>

                      <div className="text-sm mb-3">
                        {formatCriteriaDescription(historyItem.criteria)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoadCriteria(historyItem.criteria)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Load Criteria
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onRunSearch(historyItem.criteria)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Run Again
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTemplateName('');
                            setTemplateDescription('');
                            onLoadCriteria(historyItem.criteria);
                            setIsCreatingTemplate(true);
                          }}
                        >
                          <Bookmark className="mr-2 h-4 w-4" />
                          Save as Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {searchHistory.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Search history is stored locally and limited to the last 20 searches. 
                  Create templates to permanently save useful search criteria.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
    </div>
  );
}