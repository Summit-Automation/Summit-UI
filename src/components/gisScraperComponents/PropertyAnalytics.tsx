'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Home, 
  MapPin,
  Target,
  Lightbulb,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { GISProperty, PropertyAnalytics as PropertyAnalyticsType } from '@/types/gis-properties';

interface PropertyAnalyticsProps {
  properties: GISProperty[];
  savedProperties: GISProperty[];
  className?: string;
}

export default function PropertyAnalytics({ 
  properties, 
  savedProperties, 
  className 
}: PropertyAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PropertyAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateAnalytics = useCallback(() => {
    setIsLoading(true);
    
    const allProperties = [...properties, ...savedProperties];
    if (allProperties.length === 0) {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    // Calculate basic statistics
    const totalProperties = allProperties.length;
    const avgAcreage = allProperties.reduce((sum, prop) => sum + prop.acreage, 0) / totalProperties;
    
    const propertiesWithValue = allProperties.filter(prop => prop.assessed_value);
    const avgAssessedValue = propertiesWithValue.length > 0 
      ? propertiesWithValue.reduce((sum, prop) => sum + (prop.assessed_value || 0), 0) / propertiesWithValue.length
      : 0;

    // Acreage distribution
    const acreageRanges = [
      { range: '0-5 acres', min: 0, max: 5 },
      { range: '5-10 acres', min: 5, max: 10 },
      { range: '10-20 acres', min: 10, max: 20 },
      { range: '20-50 acres', min: 20, max: 50 },
      { range: '50+ acres', min: 50, max: Infinity }
    ];

    const acreageDistribution = acreageRanges.map(range => ({
      range: range.range,
      count: allProperties.filter(prop => 
        prop.acreage >= range.min && prop.acreage < range.max
      ).length
    }));

    // Value distribution
    const valueRanges = [
      { range: '$0-50k', min: 0, max: 50000 },
      { range: '$50k-100k', min: 50000, max: 100000 },
      { range: '$100k-200k', min: 100000, max: 200000 },
      { range: '$200k-500k', min: 200000, max: 500000 },
      { range: '$500k+', min: 500000, max: Infinity }
    ];

    const valueDistribution = valueRanges.map(range => ({
      range: range.range,
      count: propertiesWithValue.filter(prop => 
        (prop.assessed_value || 0) >= range.min && (prop.assessed_value || 0) < range.max
      ).length
    }));

    // City breakdown
    const cityGroups = allProperties.reduce((groups, prop) => {
      const city = prop.city || 'Unknown';
      if (!groups[city]) {
        groups[city] = [];
      }
      groups[city].push(prop);
      return groups;
    }, {} as Record<string, GISProperty[]>);

    const cityBreakdown = Object.entries(cityGroups).map(([city, props]) => ({
      city,
      count: props.length,
      avg_acreage: props.reduce((sum, prop) => sum + prop.acreage, 0) / props.length
    })).sort((a, b) => b.count - a.count);

    // Property type breakdown
    const typeGroups = allProperties.reduce((groups, prop) => {
      const type = prop.property_type || 'Unknown';
      if (!groups[type]) {
        groups[type] = 0;
      }
      groups[type]++;
      return groups;
    }, {} as Record<string, number>);

    const propertyTypeBreakdown = Object.entries(typeGroups).map(([type, count]) => ({
      type,
      count
    })).sort((a, b) => b.count - a.count);

    // Market insights
    const highValueProperties = propertiesWithValue.filter(prop => 
      (prop.assessed_value || 0) > avgAssessedValue * 1.5
    ).length;
    
    const largeAcreageProperties = allProperties.filter(prop => 
      prop.acreage > avgAcreage * 2
    ).length;

    // Potential deals (low assessed value per acre)
    const potentialDeals = propertiesWithValue.filter(prop => {
      const valuePerAcre = (prop.assessed_value || 0) / prop.acreage;
      const avgValuePerAcre = propertiesWithValue.reduce((sum, p) => 
        sum + ((p.assessed_value || 0) / p.acreage), 0
      ) / propertiesWithValue.length;
      return valuePerAcre < avgValuePerAcre * 0.7; // 30% below average
    }).length;

    const analyticsData: PropertyAnalyticsType = {
      total_properties: totalProperties,
      avg_acreage: avgAcreage,
      avg_assessed_value: avgAssessedValue,
      acreage_distribution: acreageDistribution,
      value_distribution: valueDistribution,
      city_breakdown: cityBreakdown,
      property_type_breakdown: propertyTypeBreakdown,
      market_insights: {
        high_value_properties: highValueProperties,
        large_acreage_properties: largeAcreageProperties,
        potential_deals: potentialDeals
      }
    };

    setAnalytics(analyticsData);
    setIsLoading(false);
  }, [properties, savedProperties]);

  useEffect(() => {
    generateAnalytics();
  }, [generateAnalytics]);

  if (isLoading) {
    return (
      <Card className={`card-enhanced ${className}`} data-appear>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Analyzing properties...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.total_properties === 0) {
    return (
      <Card className={`card-enhanced ${className}`} data-appear>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">Search for properties to see analytics and insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-enhanced ${className}`} data-appear>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Property Analytics & Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger 
              value="overview"
              className="rounded-md transition-all duration-200 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="distribution"
              className="rounded-md transition-all duration-200 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
            >
              Distribution
            </TabsTrigger>
            <TabsTrigger 
              value="location"
              className="rounded-md transition-all duration-200 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
            >
              Location
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className="rounded-md transition-all duration-200 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center space-y-3 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <Home className="h-10 w-10 mx-auto text-blue-600 dark:text-blue-400" />
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{analytics.total_properties}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Properties</div>
              </div>

              <div className="text-center space-y-3 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                <MapPin className="h-10 w-10 mx-auto text-green-600 dark:text-green-400" />
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{analytics.avg_acreage.toFixed(1)}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Acreage</div>
              </div>

              <div className="text-center space-y-3 p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <DollarSign className="h-10 w-10 mx-auto text-yellow-600 dark:text-yellow-400" />
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  ${analytics.avg_assessed_value > 0 
                    ? analytics.avg_assessed_value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : 'N/A'
                  }
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Assessed Value</div>
              </div>
            </div>

            {/* Market Insights Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{analytics.market_insights.high_value_properties}</div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">High-Value Properties</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-5 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="text-xl font-bold text-green-900 dark:text-green-100">{analytics.market_insights.large_acreage_properties}</div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">Large Acreage (2x+ avg)</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-5 rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <div>
                    <div className="text-xl font-bold text-orange-900 dark:text-orange-100">{analytics.market_insights.potential_deals}</div>
                    <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Potential Deals</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6 mt-6">
            {/* Acreage Distribution */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Acreage Distribution</h3>
              {analytics.acreage_distribution.map(item => (
                <div key={item.range} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.range}</span>
                    <span>{item.count} properties ({((item.count / analytics.total_properties) * 100).toFixed(1)}%)</span>
                  </div>
                  <Progress value={(item.count / analytics.total_properties) * 100} className="h-2" />
                </div>
              ))}
            </div>

            {/* Value Distribution */}
            {analytics.avg_assessed_value > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Value Distribution</h3>
                {analytics.value_distribution.map(item => (
                  <div key={item.range} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.range}</span>
                      <span>{item.count} properties ({((item.count / analytics.total_properties) * 100).toFixed(1)}%)</span>
                    </div>
                    <Progress value={(item.count / analytics.total_properties) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="location" className="space-y-6 mt-6">
            {/* City Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Properties by City/Township</h3>
              <div className="space-y-3">
                {analytics.city_breakdown.slice(0, 10).map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? 'default' : 'secondary'} className="font-medium">
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{city.city}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Avg: {city.avg_acreage.toFixed(1)} acres
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{city.count}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">properties</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Type Breakdown */}
            {analytics.property_type_breakdown.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Property Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {analytics.property_type_breakdown.map(type => (
                    <div key={type.type} className="text-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{type.count}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{type.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            {/* Market Insights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Market Insights & Recommendations
              </h3>

              <div className="space-y-3">
                {analytics.market_insights.potential_deals > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-900">Value Opportunities Identified</div>
                      <div className="text-sm text-green-700 mt-1">
                        Found {analytics.market_insights.potential_deals} properties with below-market value per acre. 
                        These could represent good investment opportunities.
                      </div>
                    </div>
                  </div>
                )}

                {analytics.market_insights.high_value_properties > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">Premium Properties Available</div>
                      <div className="text-sm text-blue-700 mt-1">
                        {analytics.market_insights.high_value_properties} high-value properties (50%+ above average) 
                        may indicate premium locations or development potential.
                      </div>
                    </div>
                  </div>
                )}

                {analytics.market_insights.large_acreage_properties > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-900">Large Acreage Opportunities</div>
                      <div className="text-sm text-purple-700 mt-1">
                        {analytics.market_insights.large_acreage_properties} properties with significant acreage 
                        (2x+ average) may be suitable for development or agricultural use.
                      </div>
                    </div>
                  </div>
                )}

                {/* Diversification insights */}
                {analytics.city_breakdown.length > 5 && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-900">Geographic Diversification</div>
                      <div className="text-sm text-orange-700 mt-1">
                        Properties span {analytics.city_breakdown.length} different cities/townships, 
                        providing good geographic diversification opportunities.
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning if no insights */}
                {analytics.market_insights.potential_deals === 0 && 
                 analytics.market_insights.high_value_properties === 0 && 
                 analytics.market_insights.large_acreage_properties === 0 && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Limited Insights Available</div>
                      <div className="text-sm text-gray-700 mt-1">
                        Try expanding your search criteria or adding more properties to get better market insights.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="font-medium">Recommended Actions:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-current rounded-full" />
                  Focus on properties in {analytics.city_breakdown[0]?.city} (highest concentration)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-current rounded-full" />
                  Consider properties in {analytics.avg_acreage.toFixed(0)}-{(analytics.avg_acreage * 1.5).toFixed(0)} acre range for optimal size
                </li>
                {analytics.avg_assessed_value > 0 && (
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-current rounded-full" />
                    Target properties under ${(analytics.avg_assessed_value * 0.8).toLocaleString()} for value opportunities
                  </li>
                )}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}