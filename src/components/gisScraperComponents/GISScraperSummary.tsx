'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GISProperty } from '@/types/gis-properties';
import { Home, MapPin, DollarSign, Archive } from 'lucide-react';

interface GISScraperSummaryProps {
  recentResults: GISProperty[];
  savedProperties: GISProperty[];
}

export default function GISScraperSummary({ recentResults, savedProperties }: GISScraperSummaryProps) {
  // Calculate summary stats
  const totalScraped = recentResults.length;
  const totalSaved = savedProperties.length;
  const exportedCount = savedProperties.filter(prop => 'exported_to_leads' in prop && prop.exported_to_leads).length;
  
  // Calculate average acreage from recent results
  const avgAcreage = recentResults.length > 0 
    ? (recentResults.reduce((sum, prop) => sum + prop.acreage, 0) / recentResults.length).toFixed(1)
    : '0.0';

  // Calculate average assessed value from recent results (only properties with values)
  const propertiesWithValue = recentResults.filter(prop => prop.assessed_value && prop.assessed_value > 0);
  const avgAssessedValue = propertiesWithValue.length > 0
    ? Math.round(propertiesWithValue.reduce((sum, prop) => sum + (prop.assessed_value || 0), 0) / propertiesWithValue.length)
    : 0;

  const summaryCards = [
    {
      title: "Recent Results",
      value: totalScraped.toLocaleString(),
      icon: Home,
      gradient: "from-blue-400 to-blue-600",
      description: "Latest search results"
    },
    {
      title: "Saved Properties",
      value: totalSaved.toLocaleString(),
      icon: Archive,
      gradient: "from-green-400 to-green-600",
      description: `${exportedCount} exported to leads`
    },
    {
      title: "Avg. Acreage",
      value: `${avgAcreage}`,
      icon: MapPin,
      gradient: "from-yellow-400 to-yellow-600",
      description: "Average property size"
    },
    {
      title: "Avg. Value",
      value: avgAssessedValue > 0 ? `$${avgAssessedValue.toLocaleString()}` : 'N/A',
      icon: DollarSign,
      gradient: "from-purple-400 to-purple-600",
      description: "Average assessed value"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="card-enhanced metric-enhanced" data-appear>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}