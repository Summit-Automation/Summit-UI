'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckSquare, 
  Download, 
  Trash2, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  X,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { GISProperty, BatchOperation } from '@/types/gis-properties';
import { toast } from 'sonner';

interface BatchOperationsProps {
  properties: GISProperty[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onBatchExport?: (ids: string[]) => Promise<void>;
  onBatchSave?: (ids: string[]) => Promise<void>;
  onBatchDelete?: (ids: string[]) => Promise<void>;
  className?: string;
}

export default function BatchOperations({
  properties,
  selectedIds,
  onSelectionChange,
  onBatchExport,
  onBatchSave,
  onBatchDelete,
  className
}: BatchOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BatchOperation | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const selectedProperties = properties.filter(prop => selectedIds.has(prop.id));
  const allSelected = properties.length > 0 && selectedIds.size === properties.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < properties.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(properties.map(prop => prop.id)));
    }
  };

  const handleBatchOperation = async (
    type: 'export' | 'save' | 'delete',
    operation: (ids: string[]) => Promise<void>
  ) => {
    if (selectedIds.size === 0) {
      toast.error('No properties selected');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentOperation({
      id: `batch-${Date.now()}`,
      type,
      property_ids: Array.from(selectedIds),
      status: 'processing',
      progress: 0,
      created_at: new Date().toISOString()
    });

    try {
      const ids = Array.from(selectedIds);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          const next = prev + Math.random() * 20;
          return next > 90 ? 90 : next;
        });
      }, 500);

      await operation(ids);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setCurrentOperation(prev => prev ? { ...prev, status: 'completed', progress: 100, completed_at: new Date().toISOString() } : null);
        toast.success(`Successfully ${type}ed ${ids.length} properties`);
        
        // Clear selection after successful operation
        onSelectionChange(new Set());
        
        // Clear operation status after a delay
        setTimeout(() => {
          setCurrentOperation(null);
          setProcessingProgress(0);
        }, 2000);
      }, 500);

    } catch (error) {
      setCurrentOperation(prev => prev ? { 
        ...prev, 
        status: 'failed', 
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      } : null);
      toast.error(`Failed to ${type} properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Selection statistics
  const selectionStats = React.useMemo(() => {
    if (selectedProperties.length === 0) return null;

    const totalAcreage = selectedProperties.reduce((sum, prop) => sum + prop.acreage, 0);
    const propertiesWithValue = selectedProperties.filter(prop => prop.assessed_value);
    const totalValue = propertiesWithValue.reduce((sum, prop) => sum + (prop.assessed_value || 0), 0);
    const avgAcreage = totalAcreage / selectedProperties.length;
    const avgValue = propertiesWithValue.length > 0 ? totalValue / propertiesWithValue.length : 0;

    const cities = [...new Set(selectedProperties.map(prop => prop.city))];
    const exportedCount = selectedProperties.filter(prop => 
      'exported_to_leads' in prop && prop.exported_to_leads
    ).length;

    return {
      count: selectedProperties.length,
      totalAcreage: totalAcreage.toFixed(1),
      avgAcreage: avgAcreage.toFixed(1),
      totalValue,
      avgValue,
      cities: cities.length,
      exportedCount,
      availableCount: selectedProperties.length - exportedCount
    };
  }, [selectedProperties]);

  return (
    <div className={`w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-6 ${className}`} data-appear>
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <CheckSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Batch Operations</h3>
        {selectedIds.size > 0 && (
          <Badge variant="secondary">
            {selectedIds.size} selected
          </Badge>
        )}
      </div>
        {/* Selection Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
              />
              <span className="text-sm font-medium">
                {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
              </span>
              <span className="text-sm text-muted-foreground">
                ({properties.length} total properties)
              </span>
            </div>

            {selectedIds.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange(new Set())}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
            )}
          </div>

        {/* Quick Selection Options */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const highValueProps = properties.filter(prop => 
                  prop.assessed_value && prop.assessed_value > 200000
                );
                onSelectionChange(new Set(highValueProps.map(prop => prop.id)));
              }}
              disabled={properties.filter(prop => prop.assessed_value && prop.assessed_value > 200000).length === 0}
              className="h-9 text-sm"
            >
              <span className="hidden sm:inline">Select High Value ($200k+)</span>
              <span className="sm:hidden">High Value</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const largeAcreageProps = properties.filter(prop => prop.acreage > 20);
                onSelectionChange(new Set(largeAcreageProps.map(prop => prop.id)));
              }}
              disabled={properties.filter(prop => prop.acreage > 20).length === 0}
              className="h-9 text-sm"
            >
              <span className="hidden sm:inline">Select Large Acreage (20+)</span>
              <span className="sm:hidden">Large Acreage</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const unexportedProps = properties.filter(prop => 
                  !('exported_to_leads' in prop) || !prop.exported_to_leads
                );
                onSelectionChange(new Set(unexportedProps.map(prop => prop.id)));
              }}
              disabled={properties.filter(prop => 
                !('exported_to_leads' in prop) || !prop.exported_to_leads
              ).length === 0}
              className="h-9 text-sm"
            >
              <span className="hidden sm:inline">Select Unexported</span>
              <span className="sm:hidden">Unexported</span>
            </Button>
          </div>
        </div>
        </div>

        {/* Selection Statistics */}
        {selectionStats && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Selection Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-600">{selectionStats.count}</div>
                <div className="text-muted-foreground">Properties</div>
              </div>
              <div>
                <div className="font-medium text-green-600">{selectionStats.totalAcreage}</div>
                <div className="text-muted-foreground">Total Acres</div>
              </div>
              <div>
                <div className="font-medium text-purple-600">{selectionStats.cities}</div>
                <div className="text-muted-foreground">Cities</div>
              </div>
              <div>
                <div className="font-medium text-orange-600">{selectionStats.availableCount}</div>
                <div className="text-muted-foreground">Available</div>
              </div>
            </div>
            
            {selectionStats.avgValue > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-3">
                <div>
                  <div className="font-medium text-yellow-600">
                    ${selectionStats.totalValue.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">Total Assessed Value</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-600">
                    ${selectionStats.avgValue.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">Average Value</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Operation Progress */}
        {currentOperation && (
          <Alert className={
            currentOperation.status === 'completed' ? 'border-green-200 bg-green-50' :
            currentOperation.status === 'failed' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }>
            <div className="flex items-center gap-2">
              {currentOperation.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {currentOperation.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-600" />}
              {currentOperation.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              
              <span className="font-medium capitalize">
                {currentOperation.type}ing {currentOperation.property_ids.length} Properties
              </span>
            </div>
            
            <AlertDescription className="mt-2 space-y-2">
              <Progress value={processingProgress} className="h-2" />
              <div className="text-sm">
                {currentOperation.status === 'processing' && `Processing... ${Math.round(processingProgress)}%`}
                {currentOperation.status === 'completed' && 'Operation completed successfully!'}
                {currentOperation.status === 'failed' && `Operation failed: ${currentOperation.error_message}`}
              </div>
            </AlertDescription>
          </Alert>
        )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="space-y-2">
          {onBatchExport && (
            <Button
              onClick={() => handleBatchOperation('export', onBatchExport)}
              disabled={selectedIds.size === 0 || isProcessing}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing && currentOperation?.type === 'export' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export ({selectedIds.size})
            </Button>
          )}

          {onBatchSave && (
            <Button
              onClick={() => handleBatchOperation('save', onBatchSave)}
              disabled={selectedIds.size === 0 || isProcessing}
              className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing && currentOperation?.type === 'save' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save ({selectedIds.size})
            </Button>
          )}

          {onBatchDelete && (
            <Button
              variant="destructive"
              onClick={() => handleBatchOperation('delete', onBatchDelete)}
              disabled={selectedIds.size === 0 || isProcessing}
              className="w-full h-10"
            >
              {isProcessing && currentOperation?.type === 'delete' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete ({selectedIds.size})
            </Button>
          )}
        </div>

        {/* Additional batch actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={() => {
              if (selectedProperties.length === 0) return;
              
              const csvData = [
                ['Owner Name', 'Address', 'City', 'Acreage', 'Assessed Value', 'Property Type'],
                ...selectedProperties.map(prop => [
                  prop.owner_name,
                  prop.address,
                  prop.city,
                  prop.acreage.toString(),
                  (prop.assessed_value || '').toString(),
                  prop.property_type || ''
                ])
              ];
              
              const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              
              const a = document.createElement('a');
              a.href = url;
              a.download = `selected-properties-${Date.now()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              toast.success(`Downloaded ${selectedProperties.length} properties as CSV`);
            }}
            className="h-9"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={() => {
              // Generate a detailed report
              if (selectionStats) {
                const report = `Property Selection Report\nGenerated: ${new Date().toLocaleString()}\n\nSummary:\n- Total Properties: ${selectionStats.count}\n- Total Acreage: ${selectionStats.totalAcreage}\n- Average Acreage: ${selectionStats.avgAcreage}\n- Cities Covered: ${selectionStats.cities}\n- Available for Export: ${selectionStats.availableCount}\n${selectionStats.totalValue > 0 ? `- Total Assessed Value: $${selectionStats.totalValue.toLocaleString()}` : ''}\n${selectionStats.avgValue > 0 ? `- Average Value: $${selectionStats.avgValue.toLocaleString()}` : ''}\n\nProperties:\n${selectedProperties.map((prop, i) => 
  `${i + 1}. ${prop.owner_name} - ${prop.address}, ${prop.city} (${prop.acreage} acres${prop.assessed_value ? `, $${prop.assessed_value.toLocaleString()}` : ''})`
).join('\n')}`;

                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `property-report-${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                toast.success('Property report downloaded');
              }
            }}
            className="h-9"
          >
            <Settings className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {selectedIds.size === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select properties from the table to perform batch operations</p>
        </div>
      )}
    </div>
  );
}