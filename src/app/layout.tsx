'use client';

import '@/app/globals.css';
import Sidebar from '@/components/globalComponents/Sidebar';
import { Inter } from "next/font/google";
import React from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

function ThemedContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { actualTheme } = useTheme();
  
  // Routes that should not have the global sidebar (full screen or custom layout)
  const noSidebarRoutes = ['/login', '/signup', '/auth', '/error', '/project-manager'];
  const isNoSidebarPage = noSidebarRoutes.some(route => pathname.startsWith(route));

  return (
    <body className={`bg-slate-950 text-slate-50 font-sans transition-colors duration-300 ${inter.className}`}>
      {isNoSidebarPage ? (
        <>{children}</>
      ) : (
        <>
          <Sidebar />
          <main className="lg:ml-[var(--sidebar-width,16rem)] min-h-screen transition-all duration-300 ease-in-out">
            <div className="pt-16 lg:pt-0">
              {children}
            </div>
          </main>
        </>
      )}
      <Toaster 
        position="top-right" 
        theme={actualTheme}
        richColors
        closeButton
      />
    </body>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      <ThemeProvider>
        <CurrencyProvider>
          <ThemedContent>
            {children}
          </ThemedContent>
        </CurrencyProvider>
      </ThemeProvider>
    </html>
  );
}