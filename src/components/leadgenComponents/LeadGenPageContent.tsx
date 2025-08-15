'use client';

import { useRouter } from 'next/navigation';
import {Header} from '@/components/globalComponents/Header';
import LeadGenContent from '@/app/leadgen/LeadGenContent';
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-96 bg-slate-700 rounded animate-pulse" />
      </div>
      
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900/90 border border-slate-800/50 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-8 bg-slate-700 rounded-lg animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-slate-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Actions skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-slate-700 rounded-xl animate-pulse" />
        <div className="h-10 w-32 bg-slate-700 rounded-xl animate-pulse" />
      </div>
      
      {/* Table skeleton */}
      <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl">
        <CardHeader>
          <div className="h-6 w-16 bg-slate-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeadGenPageContent() {
    const router = useRouter();

    const handleSettings = () => router.push('/settings');
    const handleHelp = () => router.push('/?tab=help');

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <Header 
                title="Lead Generation"
                subtitle="Manage your leads with manual entry and AI-powered generation"
                onSettings={handleSettings}
                onHelp={handleHelp}
            />

            <div className="px-4 lg:px-6">
                <Suspense fallback={<LoadingSkeleton />}>
                    <LeadGenContent />
                </Suspense>
            </div>
        </div>
    );
}