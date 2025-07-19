'use client';

import '@/app/globals.css';
import Sidebar from '@/components/globalComponents/Sidebar';
import { Inter } from "next/font/google";
import React from 'react';
import { usePathname } from 'next/navigation';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Routes that should not have the sidebar (full screen)
  const authRoutes = ['/login', '/signup', '/auth', '/error'];
  const isAuthPage = authRoutes.some(route => pathname.startsWith(route));

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Summit Automation Dashboard</title>
        <meta name="description" content="AI Automated Tools" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`bg-slate-950 text-slate-100 font-sans ${inter.className}`}>
        {isAuthPage ? (
          // Auth pages get full screen - no sidebar, no margins
          <>{children}</>
        ) : (
          // Regular pages get responsive sidebar + main content
          <>
            <Sidebar />
            <main className="lg:ml-64 min-h-screen">
              {/* Mobile: Add top padding for hamburger button + content padding */}
              <div className="pt-16 lg:pt-6 px-4 sm:px-6 lg:px-6 pb-6">
                {children}
              </div>
            </main>
          </>
        )}
      </body>
    </html>
  );
}