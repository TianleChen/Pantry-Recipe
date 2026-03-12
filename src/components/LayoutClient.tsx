'use client';

import Navigation from './Navigation';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}
