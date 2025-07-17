import '@/app/globals.css'
import Sidebar from '@/components/globalComponents/Sidebar'
import React from 'react'

export const metadata = {
    title: 'Summit Automation', description: 'Contractor CRM and Bookkeeper',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (<html lang="en">
        <body className="bg-slate-950 text-slate-100 font-sans">
        <Sidebar/>

        {/* Main content with margin to account for sidebar width */}
        <main className="ml-64 p-6 min-h-screen overflow-auto">
            {children}
        </main>
        </body>
        </html>)
}

