'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Activity Log</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Activity className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-gray-500 text-center max-w-md">
            Activity logging and audit trail features are currently under development. 
            Check back soon to track all system activities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
