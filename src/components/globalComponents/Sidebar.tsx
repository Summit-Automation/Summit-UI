'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    Calculator,
} from 'lucide-react';

const navItems = [
    {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard
    },
    {
        href: '/crm',
        label: 'CRM',
        icon: Users
    },
    {
        href: '/bookkeeper',
        label: 'Bookkeeper',
        icon: Calculator
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="fixed inset-y-0 left-0 w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col z-50 shadow-lg"
        >
            {/* Header with Logo */}
            <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center justify-center mb-2">
                    <Image
                        src="/logo.svg"
                        alt="Summit Automation Logo"
                        width={175}
                        height={40}
                        priority
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link key={href} href={href} className="block">
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-card text-sky-500 hover:bg-highlight-bg shadow-sm"
                                        : "text-muted hover:bg-card hover:text-foreground"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-sidebar-border text-center text-xs text-muted">
                <div>© 2025 Summit Automation</div>
                <div>v1.0.0</div>
            </div>
        </aside>
    );
}
