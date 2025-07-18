// app/layout.tsx
import type { Metadata } from "next";
import '@/app/globals.css';
import Sidebar from '@/components/globalComponents/Sidebar';
import { Inter } from "next/font/google";
import React from 'react';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

// Define metadata for all pages
export const metadata: Metadata = {
  title: 'Summit Automation Dashboard',
  description: 'AI Automated Tools',
};

// Reusable HeadContent component for favicon and meta tags
function HeadContent() {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </head>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <HeadContent />
      <body className={`bg-slate-950 text-slate-100 font-sans ${inter.className}`}>
        <Sidebar />
        <main className="ml-64 p-6 min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}