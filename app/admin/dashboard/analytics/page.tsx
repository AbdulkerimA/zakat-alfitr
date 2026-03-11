'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-gray-500 text-center max-w-md">
            Analytics and reporting features are currently under development. 
            Check back soon for detailed insights and statistics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
