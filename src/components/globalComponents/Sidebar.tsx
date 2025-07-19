'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import OrganizationDisplay from '@/components/organizationComponents/OrganizationDisplay';
import {
    LayoutDashboard,
    Users,
    Calculator,
    Car,
    LogOut,
    Menu,
    X,
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
    const [isOpen, setIsOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById('mobile-sidebar');
            const hamburger = document.getElementById('hamburger-button');
            
            if (isOpen && sidebar && hamburger && 
                !sidebar.contains(event.target as Node) && 
                !hamburger.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const supabase = createClient();

        // Get initial user
        const getInitialUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (user && !error) {
                setUser({
                    email: user.email || '',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    avatar_url: user.user_metadata?.avatar_url
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        getInitialUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser({
                        email: session.user.email || '',
                        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                        avatar_url: session.user.user_metadata?.avatar_url
                    });
                    setLoading(false);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
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
        return user.email?.split('@')[0] || 'User';
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                id="hamburger-button"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[60] lg:hidden bg-slate-900/95 backdrop-blur-sm border border-slate-700 p-2 rounded-lg shadow-lg transition-colors hover:bg-slate-800"
                aria-label="Toggle navigation menu"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-slate-300" />
                ) : (
                    <Menu className="h-6 w-6 text-slate-300" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200" />
            )}

            {/* Sidebar - Desktop (always visible) + Mobile (slide in) */}
            <aside
                id="mobile-sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out",
                    // Desktop: always visible
                    "lg:translate-x-0",
                    // Mobile: slide in/out
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800">
                    {/* Mobile: Add top padding to account for hamburger button */}
                    <div className="lg:hidden h-8" />
                    
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="Summit Automation"
                            width={175}
                            height={40}
                            priority
                            className="max-w-full h-auto"
                        />
                    </div>
                    
                    {/* Organization Display */}
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <OrganizationDisplay />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
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
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        <span className="truncate">{label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    {loading ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse flex-shrink-0"></div>
                                <div className="min-w-0 flex-1">
                                    <div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-12 bg-slate-700 rounded animate-pulse mt-1"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {user?.avatar_url ? (
                                    <Image 
                                        src={user.avatar_url} 
                                        alt="User avatar"
                                        width={32}
                                        height={32}
                                        className="rounded-full flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                                className="text-slate-400 hover:text-white flex-shrink-0 ml-2"
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
        </>
    );
}