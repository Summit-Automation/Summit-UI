'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Database,
  Users,
  Info,
  CheckCircle2
} from 'lucide-react';
import { GISProperty } from '@/types/gis-properties';
import { toast } from 'sonner';

interface ExportField {
  key: keyof GISProperty | string;
  label: string;
  required?: boolean;
  format?: (value: unknown, property: GISProperty) => string;
}

const EXPORT_FIELDS: ExportField[] = [
  { key: 'owner_name', label: 'Owner Name', required: true },
  { key: 'address', label: 'Property Address', required: true },
  { key: 'city', label: 'City/Township', required: true },
  { key: 'acreage', label: 'Acreage', format: (value) => typeof value === 'number' ? value.toFixed(2) : '0' },
  { key: 'assessed_value', label: 'Assessed Value', format: (value) => typeof value === 'number' ? `$${value.toLocaleString()}` : 'N/A' },
  { key: 'property_type', label: 'Property Type' },
  { key: 'parcel_id', label: 'Parcel ID' },
  { key: 'scraped_at', label: 'Date Scraped', format: (value) => typeof value === 'string' ? new Date(value).toLocaleDateString() : '' },
  { key: 'value_per_acre', label: 'Value per Acre', format: (_, prop) => 
    prop.assessed_value ? `$${Math.round((prop.assessed_value / prop.acreage)).toLocaleString()}` : 'N/A'
  },
  { key: 'exported_status', label: 'Export Status', format: (_, prop) => 
    ('exported_to_leads' in prop && prop.exported_to_leads) ? 'Exported' : 'Available'
  }
];

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV (Comma Separated)', icon: FileText, description: 'Standard spreadsheet format' },
  { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, description: 'Microsoft Excel format with formatting' },
  { value: 'json', label: 'JSON', icon: Database, description: 'Structured data format for developers' },
  { value: 'pdf', label: 'PDF Report', icon: FileText, description: 'Formatted report for presentations' }
];

const CRM_INTEGRATIONS = [
  { value: 'leadgen', label: 'Lead Generation CRM', description: 'Export directly to your CRM system' }
];

interface EnhancedExportOptionsProps {
  properties: GISProperty[];
  selectedProperties?: GISProperty[];
  onExport?: (format: string, options: Record<string, unknown>) => void;
  onClose?: () => void;
  className?: string;
}

export default function EnhancedExportOptions({
  properties,
  selectedProperties,
  onExport,
  onClose,
  className
}: EnhancedExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(EXPORT_FIELDS.filter(field => field.required).map(field => field.key))
  );
  const [crmIntegration, setCrmIntegration] = useState<string>('');
  const [reportTitle, setReportTitle] = useState('');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const exportData = selectedProperties || properties;
  const hasSelection = selectedProperties && selectedProperties.length > 0;

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    const newSelectedFields = new Set(selectedFields);
    if (checked) {
      newSelectedFields.add(fieldKey);
    } else {
      // Don't allow unchecking required fields
      const field = EXPORT_FIELDS.find(f => f.key === fieldKey);
      if (!field?.required) {
        newSelectedFields.delete(fieldKey);
      }
    }
    setSelectedFields(newSelectedFields);
  };

  const generateExportData = () => {
    const selectedFieldObjects = EXPORT_FIELDS.filter(field => 
      selectedFields.has(field.key)
    );

    const headers = selectedFieldObjects.map(field => field.label);
    const rows = exportData.map(property => 
      selectedFieldObjects.map(field => {
        const value = property[field.key as keyof GISProperty];
        return field.format ? field.format(value, property) : (value?.toString() || '');
      })
    );

    return { headers, rows, fields: selectedFieldObjects };
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportOptions = {
        format: selectedFormat,
        fields: Array.from(selectedFields),
        includeAnalytics,
        reportTitle: reportTitle || `Property Export - ${new Date().toLocaleDateString()}`,
        crmIntegration
      };

      if (selectedFormat === 'csv' || selectedFormat === 'excel') {
        const { headers, rows } = generateExportData();
        downloadFile(headers, rows, selectedFormat);
      } else if (selectedFormat === 'json') {
        downloadJSON();
      } else if (selectedFormat === 'pdf') {
        generatePDF();
      }

      onExport?.(selectedFormat, exportOptions);
      toast.success(`Export completed successfully (${exportData.length} properties)`);
      
    } catch (error) {
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (headers: string[], rows: string[][], format: 'csv' | 'excel') => {
    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `gis-properties-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      // For Excel, we'll create a more structured format
      // In a real implementation, you'd use a library like xlsx
      const tsvContent = [
        headers.join('\t'),
        ...rows.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `gis-properties-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadJSON = () => {
    const jsonData = {
      export_info: {
        title: reportTitle || `Property Export - ${new Date().toLocaleDateString()}`,
        generated_at: new Date().toISOString(),
        total_properties: exportData.length,
        fields_included: Array.from(selectedFields)
      },
      properties: exportData.map(property => {
        const exportedProperty: Record<string, unknown> = {};
        EXPORT_FIELDS.forEach(field => {
          if (selectedFields.has(field.key)) {
            const value = property[field.key as keyof GISProperty];
            exportedProperty[field.key] = field.format ? field.format(value, property) : value;
          }
        });
        return exportedProperty;
      }),
      analytics: includeAnalytics ? {
        total_count: exportData.length,
        avg_acreage: exportData.reduce((sum, prop) => sum + prop.acreage, 0) / exportData.length,
        avg_assessed_value: exportData.filter(p => p.assessed_value).reduce((sum, prop) => sum + (prop.assessed_value || 0), 0) / exportData.filter(p => p.assessed_value).length,
        city_breakdown: Object.entries(
          exportData.reduce((groups, prop) => {
            groups[prop.city] = (groups[prop.city] || 0) + 1;
            return groups;
          }, {} as Record<string, number>)
        ).map(([city, count]) => ({ city, count }))
      } : undefined
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gis-properties-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    // In a real implementation, you'd use a PDF library like jsPDF or generate server-side
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle || 'Property Report'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${reportTitle || 'Property Report'}</h1>
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Properties:</strong> ${exportData.length}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Average Acreage:</strong> ${(exportData.reduce((sum, prop) => sum + prop.acreage, 0) / exportData.length).toFixed(2)}</p>
        </div>
        <table>
          <thead>
            <tr>${EXPORT_FIELDS.filter(field => selectedFields.has(field.key)).map(field => `<th>${field.label}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${exportData.map(property => `
              <tr>
                ${EXPORT_FIELDS.filter(field => selectedFields.has(field.key)).map(field => {
                  const value = property[field.key as keyof GISProperty];
                  const displayValue = field.format ? field.format(value, property) : (value?.toString() || '');
                  return `<td>${displayValue}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `property-report-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.info('HTML report downloaded. Open in browser and print to PDF');
  };


  return (
    <Card className={`card-enhanced ${className}`} data-appear>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Enhanced Export Options
          </CardTitle>
          {hasSelection && (
            <Badge variant="secondary">
              {selectedProperties!.length} selected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4 mt-6">
            <div className="space-y-3">
              <Label>Export Format</Label>
              {EXPORT_FORMATS.map(format => {
                const Icon = format.icon;
                return (
                  <div
                    key={format.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFormat === format.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFormat(format.value)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm text-muted-foreground">{format.description}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedFormat === format.value 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-300'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4 mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select Fields to Export</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields(new Set(EXPORT_FIELDS.map(f => f.key)))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields(new Set(EXPORT_FIELDS.filter(f => f.required).map(f => f.key)))}
                  >
                    Required Only
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXPORT_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.has(field.key)}
                      onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                      disabled={field.required}
                    />
                    <Label htmlFor={field.key} className="flex-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                ))}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Fields marked with * are required and cannot be removed. 
                  Selected {selectedFields.size} of {EXPORT_FIELDS.length} available fields.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report_title">Report Title (Optional)</Label>
                <input
                  id="report_title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Custom report title..."
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_analytics"
                  checked={includeAnalytics}
                  onCheckedChange={(checked) => setIncludeAnalytics(checked === true)}
                />
                <Label htmlFor="include_analytics">Include analytics summary</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4 mt-6">
            <div className="space-y-3">
              <Label>CRM Integration (Optional)</Label>
              {CRM_INTEGRATIONS.map(integration => (
                <div
                  key={integration.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    crmIntegration === integration.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCrmIntegration(
                    crmIntegration === integration.value ? '' : integration.value
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{integration.label}</div>
                      <div className="text-sm text-muted-foreground">{integration.description}</div>
                    </div>
                    {integration.value === 'leadgen' && (
                      <Badge variant="default">Recommended</Badge>
                    )}
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      crmIntegration === integration.value 
                        ? 'border-primary bg-primary' 
                        : 'border-gray-300'
                    }`} />
                  </div>
                </div>
              ))}

              {crmIntegration && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Properties will be automatically imported to your {CRM_INTEGRATIONS.find(i => i.value === crmIntegration)?.label} after export.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Summary and Actions */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Ready to export {exportData.length} properties with {selectedFields.size} fields in {EXPORT_FORMATS.find(f => f.value === selectedFormat)?.label} format
            </div>
            <Badge variant="outline">
              {exportData.length} properties
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting || exportData.length === 0}
              className="flex-1 md:flex-initial"
            >
              {isExporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {exportData.length} Properties
                </>
              )}
            </Button>

            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}