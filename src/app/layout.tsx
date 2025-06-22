import './globals.css'
import Sidebar from '@/components/Sidebar'
import React from "react";

export const metadata = {
    title: 'Summit Automation',
    description: 'Contractor CRM and Bookkeeper',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="flex bg-slate-900 text-slate-100 font-sans">
        <Sidebar />
        <main className="flex-1 p-6 min-h-screen bg-slate-900 overflow-auto">
            {children}
        </main>
        </body>
        </html>
    );
}
