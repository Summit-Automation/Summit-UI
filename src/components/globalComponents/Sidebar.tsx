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
    UserPlus,
    Package,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

const navItems = [
    {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        category: 'Overview'
    },
    {
        href: '/crm',
        label: 'CRM',
        icon: Users,
        category: 'Business'
    },
    {
        href: '/bookkeeper',
        label: 'Accounting', 
        icon: Calculator,
        category: 'Business'
    },
    {
        href: '/mileage',
        label: 'Mileage Tracking',
        icon: Car,
        category: 'Operations'
    },
    {
        href: '/inventory',
        label: 'Inventory',
        icon: Package,
        category: 'Operations',
        badge: 'Beta'
    },
    {
        href: '/leadgen',
        label: 'Lead Generation',
        icon: UserPlus,
        category: 'Marketing',
        badge: 'AI'
    },
];

interface UserData {
    email: string;
    full_name?: string;
    avatar_url?: string;
    organization_id?: string;
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
                    avatar_url: user.user_metadata?.avatar_url,
                    organization_id: user.user_metadata?.organization_id,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        // Function to refresh user data
        const refreshUserData = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user && !error) {
                setUser({
                    email: user.email || '',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    avatar_url: user.user_metadata?.avatar_url,
                    organization_id: user.user_metadata?.organization_id,
                });
            }
        };

        getInitialUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser({
                        email: session.user.email || '',
                        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                        avatar_url: session.user.user_metadata?.avatar_url,
                        organization_id: session.user.user_metadata?.organization_id,
                    });
                    setLoading(false);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        // Listen for custom user data update events
        const handleUserDataUpdate = () => {
            refreshUserData();
        };

        window.addEventListener('userDataUpdated', handleUserDataUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('userDataUpdated', handleUserDataUpdate);
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
                className="fixed top-4 left-4 z-[60] lg:hidden bg-slate-900/95 backdrop-blur-sm border border-slate-700 p-2 rounded-lg shadow-lg transition-colors hover:bg-slate-800 btn-feedback hamburger-btn"
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
                    "fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/60 flex flex-col transition-transform duration-300 ease-in-out custom-scrollbar sidebar-bg",
                    // Desktop: always visible
                    "lg:translate-x-0",
                    // Mobile: slide in/out
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 sidebar-border">
                    {/* Mobile: Add top padding to account for hamburger button */}
                    <div className="lg:hidden h-8" />
                    
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                            <Image
                                src="/logo.svg"
                                alt="Summit Automation"
                                width={175}
                                height={40}
                                priority
                                className="max-w-full h-auto drop-shadow-lg"
                            />
                            {/* Subtle glow effect behind logo */}
                            <div className="absolute inset-0 -z-10 bg-blue-500/20 blur-xl rounded-full transform scale-150 opacity-50" />
                        </div>
                    </div>
                    
                    {/* Organization Display */}
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800/40 transition-all duration-200 hover:bg-slate-900/70 hover:border-slate-700/60 sidebar-org-bg">
                        <OrganizationDisplay />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {Object.entries(
                            navItems.reduce((acc, item) => {
                                if (!acc[item.category]) acc[item.category] = [];
                                acc[item.category].push(item);
                                return acc;
                            }, {} as Record<string, typeof navItems>)
                        ).map(([category, items]) => (
                            <div key={category}>
                                <h3 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider sidebar-text">
                                    {category}
                                </h3>
                                <div className="space-y-1">
                                    {items.map(({ href, label, icon: Icon, badge }) => {
                                        const isActive = pathname === href;

                                        return (
                                            <Link key={href} href={href}>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative sidebar-nav-item",
                                                        isActive 
                                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 sidebar-nav-active" 
                                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                                                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                                    )} />
                                                    <span className="truncate flex-1">{label}</span>
                                                    {badge && (
                                                        <span className={cn(
                                                            "px-2 py-0.5 text-xs font-medium rounded-full",
                                                            badge === 'AI' 
                                                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                        )}>
                                                            {badge}
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-r-full" />
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 sidebar-border">
                    {loading ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 loading-enhanced rounded-full flex-shrink-0"></div>
                                <div className="min-w-0 flex-1">
                                    <div className="h-4 w-16 loading-enhanced rounded mb-1"></div>
                                    <div className="h-3 w-12 loading-enhanced rounded"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {user?.avatar_url ? (
                                    <div className="relative">
                                        <Image 
                                            src={user.avatar_url} 
                                            alt="User avatar"
                                            width={36}
                                            height={36}
                                            className="rounded-full flex-shrink-0 ring-1 ring-slate-700"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <span className="text-white text-sm font-medium">
                                            {user ? getUserInitials(getDisplayName()) : 'U'}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-200 truncate sidebar-text" title={getDisplayName()}>
                                        {getDisplayName()}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate sidebar-text-secondary" title={user?.email}>
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 flex-shrink-0 ml-2 transition-all duration-200 rounded-lg"
                                onClick={handleSignOut}
                                title="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-slate-800/50 text-center text-xs text-slate-600 sidebar-text-muted">
                        © 2025 Summit Automation
                    </div>
                </div>
            </aside>
        </>
    );
}