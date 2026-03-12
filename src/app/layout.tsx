import type { Metadata } from 'next';
import './globals.css';
import { LayoutClient } from '@/components/LayoutClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Home Pantry Recipe',
  description: 'Track your ingredients and get recipe recommendations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
