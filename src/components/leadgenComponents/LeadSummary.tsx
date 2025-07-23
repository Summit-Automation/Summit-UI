'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStats } from "@/types/leadgen";
import { Users, Target, TrendingUp, Star } from "lucide-react";

interface LeadSummaryProps {
  stats: LeadStats;
}

function LeadSummary({ stats }: LeadSummaryProps) {
  const summaryCards = [
    {
      title: "Total Leads",
      value: stats.total_leads.toLocaleString(),
      icon: Users,
      gradient: "from-blue-400 to-blue-600",
      description: "All time leads"
    },
    {
      title: "Qualified Leads",
      value: stats.qualified_leads.toLocaleString(),
      icon: Target,
      gradient: "from-green-400 to-green-600",
      description: `${((stats.qualified_leads / stats.total_leads) * 100 || 0).toFixed(1)}% qualification rate`
    },
    {
      title: "Average Score",
      value: stats.average_score.toFixed(1),
      icon: Star,
      gradient: "from-yellow-400 to-yellow-600",
      description: "Lead quality score"
    },
    {
      title: "Conversion Rate",
      value: `${(stats.conversion_rate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      gradient: "from-purple-400 to-purple-600",
      description: "Leads to customers"
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
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${card.gradient} flex items-center justify-center`}>
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

// Memoize to prevent unnecessary re-renders when stats haven't changed
export default React.memo(LeadSummary, (prevProps, nextProps) => {
  const prevStats = prevProps.stats;
  const nextStats = nextProps.stats;
  
  return (
    prevStats.total_leads === nextStats.total_leads &&
    prevStats.qualified_leads === nextStats.qualified_leads &&
    prevStats.manual_leads === nextStats.manual_leads &&
    prevStats.ai_generated_leads === nextStats.ai_generated_leads &&
    prevStats.average_score === nextStats.average_score &&
    prevStats.conversion_rate === nextStats.conversion_rate
  );
});