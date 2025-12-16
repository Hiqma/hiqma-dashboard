'use client';

import { useState } from 'react';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import EnhancedAnalytics from '@/components/EnhancedAnalytics';

export default function AnalyticsPage() {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <div className="pt-2 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-black">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights and performance metrics with device and student attribution.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setUseEnhanced(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !useEnhanced 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Legacy View
              </button>
              <button
                onClick={() => setUseEnhanced(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  useEnhanced 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Enhanced View
              </button>
            </div>
          </div>
        </div>
        {useEnhanced ? <EnhancedAnalytics /> : <AdvancedAnalytics />}
      </div>
    </div>
  );
}