'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageExtractor from '@/components/ImageExtractor';

export default function QuickAddPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Quick Add Ingredients</h1>

      <ImageExtractor
        defaultLocation="fridge"
        defaultCategory="vegetables"
        onSaveComplete={() => {
          // Refresh inventory and show success
          setTimeout(() => {
            router.push('/inventory');
          }, 500);
        }}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Take a clear photo of your receipt, pantry shelf, or grocery bag</li>
          <li>• Make sure text is legible and items are clearly visible</li>
          <li>• Good lighting helps with accuracy</li>
          <li>• Review extracted items before saving - you can edit quantities and dates</li>
        </ul>
      </div>
    </div>
  );
}
