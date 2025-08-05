'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCheck, 
  Plus, 
  Loader2, 
  Trash2, 
  Home,
  MapPin,
  DollarSign,
  Building2,
  User
} from 'lucide-react';
import { GISProperty } from '@/types/gis-properties';

interface GISPropertyTableProps {
  properties: GISProperty[];
  showActions?: boolean;
  actionType?: 'export' | 'save' | 'delete';
  exportingIds: Set<string>;
  savingIds: Set<string>;
  onExportProperty: (propertyId: string) => void;
  onSaveProperty: (property: GISProperty) => void;
  onDeleteProperty: (propertyId: string) => void;
}

const MobilePropertyCard = React.memo(function MobilePropertyCard({ 
  property, 
  actionType,
  exportingIds,
  savingIds,
  onExportProperty,
  onSaveProperty,
  onDeleteProperty
}: { 
  property: GISProperty;
  actionType: 'export' | 'save' | 'delete';
  exportingIds: Set<string>;
  savingIds: Set<string>;
  onExportProperty: (propertyId: string) => void;
  onSaveProperty: (property: GISProperty) => void;
  onDeleteProperty: (propertyId: string) => void;
}) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-4 w-4" />
              {property.address}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.city}
              </Badge>
              <Badge variant="outline">
                {property.acreage} acres
              </Badge>
              {'exported_to_leads' in property && property.exported_to_leads ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCheck className="h-3 w-3" />
                  Exported
                </Badge>
              ) : (
                <Badge variant="outline">Available</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="font-medium">{property.owner_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>
              {property.assessed_value 
                ? `$${property.assessed_value.toLocaleString()}` 
                : 'N/A'
              }
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{property.property_type || 'N/A'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {actionType === 'save' && (
              (() => {
                const tempId = `${property.owner_name}-${property.address}`.replace(/\s+/g, '-');
                const isSaving = savingIds.has(tempId);
                
                return (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSaveProperty(property)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1 h-3 w-3" />
                        Save Property
                      </>
                    )}
                  </Button>
                );
              })()
            )}
            
            {actionType === 'export' && (
              !('exported_to_leads' in property && property.exported_to_leads) ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExportProperty(property.id)}
                  disabled={exportingIds.has(property.id)}
                  className="flex-1"
                >
                  {exportingIds.has(property.id) ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 h-3 w-3" />
                      Export to CRM
                    </>
                  )}
                </Button>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 flex-1 justify-center py-2">
                  <CheckCheck className="h-3 w-3" />
                  Already Exported
                </Badge>
              )
            )}
            
            {actionType === 'delete' && (
              <div className="flex gap-2 w-full">
                {!('exported_to_leads' in property && property.exported_to_leads) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExportProperty(property.id)}
                    disabled={exportingIds.has(property.id)}
                    className="flex-1"
                  >
                    {exportingIds.has(property.id) ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1 h-3 w-3" />
                        Export
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteProperty(property.id)}
                  className="flex-1"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default function GISPropertyTable({ 
  properties, 
  showActions = true, 
  actionType = 'export',
  exportingIds,
  savingIds,
  onExportProperty,
  onSaveProperty,
  onDeleteProperty
}: GISPropertyTableProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we should show mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Throttle resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    checkMobile();
    window.addEventListener('resize', throttledCheckMobile, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', throttledCheckMobile);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="space-y-4">
        {properties.map((property, index) => (
          <MobilePropertyCard
            key={property.id || `${property.owner_name}-${property.address}-${index}`.replace(/\s+/g, '-')}
            property={property}
            actionType={actionType}
            exportingIds={exportingIds}
            savingIds={savingIds}
            onExportProperty={onExportProperty}
            onSaveProperty={onSaveProperty}
            onDeleteProperty={onDeleteProperty}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className="card-enhanced" data-appear>
      <CardHeader>
        <CardTitle>Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Acreage</TableHead>
              <TableHead>Assessed Value</TableHead>
              <TableHead>Property Type</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property, index) => {
              const uniqueKey = property.id || `${property.owner_name}-${property.address}-${index}`.replace(/\s+/g, '-');
              return (
                <TableRow key={uniqueKey}>
                  <TableCell>
                    <div className="font-medium">{property.owner_name}</div>
                  </TableCell>
                  <TableCell>{property.address}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>{property.acreage} acres</TableCell>
                  <TableCell>
                    {property.assessed_value 
                      ? `$${property.assessed_value.toLocaleString()}` 
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>{property.property_type || 'N/A'}</TableCell>
                  <TableCell>
                    {'exported_to_leads' in property && property.exported_to_leads ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" />
                        Exported
                      </Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      {actionType === 'save' && (
                        (() => {
                          const tempId = `${property.owner_name}-${property.address}`.replace(/\s+/g, '-');
                          const isSaving = savingIds.has(tempId);
                          
                          return (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSaveProperty(property)}
                              disabled={isSaving}
                              title="Save Property"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-1 h-3 w-3" />
                                  Save
                                </>
                              )}
                            </Button>
                          );
                        })()
                      )}
                      
                      {actionType === 'export' && (
                        !('exported_to_leads' in property && property.exported_to_leads) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExportProperty(property.id)}
                            disabled={exportingIds.has(property.id)}
                            title="Export to CRM"
                          >
                            {exportingIds.has(property.id) ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-1 h-3 w-3" />
                                Export to CRM
                              </>
                            )}
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCheck className="h-3 w-3" />
                            Exported
                          </Badge>
                        )
                      )}
                      
                      {actionType === 'delete' && (
                        <div className="flex gap-2">
                          {!('exported_to_leads' in property && property.exported_to_leads) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onExportProperty(property.id)}
                              disabled={exportingIds.has(property.id)}
                              title="Export to CRM"
                            >
                              {exportingIds.has(property.id) ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Exporting...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-1 h-3 w-3" />
                                  Export
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteProperty(property.id)}
                            title="Delete Property"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {properties.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No properties found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}