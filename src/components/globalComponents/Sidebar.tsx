'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Calculator,
    Car,
    LogOut,
} from 'lucide-react';

const navItems = [
    {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        href: '/crm',
        label: 'CRM',
        icon: Users,
    },
    {
        href: '/bookkeeper',
        label: 'Accounting',
        icon: Calculator,
    },
    {
        href: '/mileage',
        label: 'Mileage',
        icon: Car,
    },
];

interface UserData {
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (user && !error) {
                setUser({
                    email: user.email || '',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    avatar_url: user.user_metadata?.avatar_url
                });
            }
            setLoading(false);
        };

        getUser();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getDisplayName = () => {
        if (!user) return 'User';
        if (user.full_name && user.full_name !== user.email?.split('@')[0]) {
            return user.full_name;
        }
        // If no full name, use the part before @ in email
        return user.email?.split('@')[0] || 'User';
    };

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col z-50">
            {/* Clean Header */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-center">
                    <Image
                        src="/logo.svg"
                        alt="Summit Automation"
                        width={175}
                        height={40}
                        priority
                    />
                </div>
            </div>

            {/* Clean Navigation */}
            <nav className="flex-1 p-4">
                <div className="space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;

                        return (
                            <Link key={href} href={href}>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive 
                                            ? "bg-blue-600 text-white shadow-sm" 
                                            : "text-slate-300 hover:text-white hover:bg-slate-800"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {label}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Enhanced Footer with Real User Data */}
            <div className="p-4 border-t border-slate-800">
                {loading ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
                            <div>
                                <div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-3 w-12 bg-slate-700 rounded animate-pulse mt-1"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {user?.avatar_url ? (
                                <img 
                                    src={user.avatar_url} 
                                    alt="User avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user ? getUserInitials(getDisplayName()) : 'U'}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate" title={getDisplayName()}>
                                    {getDisplayName()}
                                </p>
                                <p className="text-xs text-slate-400 truncate" title={user?.email}>
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-white flex-shrink-0"
                            onClick={handleSignOut}
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                
                <div className="mt-4 text-center text-xs text-slate-500">
                    © 2025 Summit Automation
                </div>
            </div>
        </aside>
    );
}