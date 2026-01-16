'use client';

import EnhancedAnalytics from '@/components/EnhancedAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive insights and performance metrics with device and student attribution.
        </p>
      </div>
      
      <EnhancedAnalytics />
    </div>
  );
}