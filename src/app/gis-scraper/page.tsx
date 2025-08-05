import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { hasGISPermission } from "@/app/lib/services/gisServices/checkGISPermissions";
import GISScraperContent from "@/components/gisScraperComponents/GISScraperContent";

export const dynamic = 'force-dynamic';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
      </div>
      
      {/* Form skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
      
      {/* Results skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function GISScraperPage() {
  // Check GIS permissions before rendering the page
  const permissionCheck = await hasGISPermission();
  
  if (!permissionCheck.hasAccess) {
    // Redirect to dashboard if user doesn't have access
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GIS Property Scraper</h1>
        <p className="text-muted-foreground">
          Extract property leads from Lawrence County GIS based on location and acreage criteria
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <GISScraperContent />
      </Suspense>
    </div>
  );
}