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
import { useAllowedNavItems } from '@/hooks/useUserPermissions';
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
    Kanban,
    ChevronLeft,
    ChevronRight,
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
    {
        href: '/project-manager',
        label: 'Project Manager',
        icon: Kanban,
        category: 'Operations',
        badge: 'New'
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { allowedItems: allowedNavItems, loading: permissionsLoading } = useAllowedNavItems(navItems);

    // Initialize collapsed state from localStorage after hydration
    useEffect(() => {
        const savedCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        setIsCollapsed(savedCollapsed);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Save collapsed state to localStorage and update CSS property
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
        document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '4rem' : '16rem');
    }, [isCollapsed]);

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
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200" 
                    onClick={() => setIsOpen(false)}
                    onTouchEnd={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar - Desktop (collapsible) + Mobile (slide in) */}
            <aside
                id="mobile-sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-slate-950/98 backdrop-blur-xl border-r border-slate-800/40 flex flex-col transition-all duration-300 ease-in-out custom-scrollbar sidebar-bg shadow-2xl",
                    // Desktop: collapsible
                    isCollapsed ? "lg:w-16" : "lg:w-64",
                    "lg:translate-x-0",
                    // Mobile: slide in/out (always full width on mobile)
                    "w-64",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800/30 sidebar-border relative">
                    {/* Mobile: Add top padding to account for hamburger button */}
                    <div className="lg:hidden h-8" />
                    
                    {/* Desktop Collapse Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCollapsed(!isCollapsed);
                        }}
                        className="hidden lg:flex absolute -right-3 top-6 z-[60] bg-slate-900/95 border border-slate-700 p-1.5 rounded-full shadow-lg transition-all duration-200 hover:bg-slate-800 hover:border-slate-600 hover:scale-110 active:scale-95 pointer-events-auto"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-slate-300 transition-transform duration-200" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-slate-300 transition-transform duration-200" />
                        )}
                    </button>
                    
                    <div className={cn("flex items-center justify-center mb-4", isCollapsed && "lg:hidden")}>
                        <div className="relative">
                            <Image
                                src="/logo.svg"
                                alt="Summit Automation"
                                width={175}
                                height={40}
                                priority
                                className="max-w-full h-auto drop-shadow-xl"
                            />
                            {/* Enhanced glow effect behind logo */}
                            <div className="absolute inset-0 -z-10 bg-blue-500/25 blur-2xl rounded-full transform scale-150 opacity-60" />
                        </div>
                    </div>
                    
                    {/* Organization Display */}
                    <div className={cn("mt-4 p-4 bg-gradient-to-br from-slate-900/70 to-slate-800/50 rounded-xl border border-slate-700/30 transition-all duration-200 hover:from-slate-900/80 hover:to-slate-800/60 hover:border-slate-600/40 sidebar-org-bg shadow-lg backdrop-blur-sm", isCollapsed && "lg:hidden")}>
                        <OrganizationDisplay />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{pointerEvents: 'auto'}}>
                    <div className="space-y-6">
                        {/* Always show navigation, even while loading */}
                        {(!allowedNavItems || allowedNavItems.length === 0) && (loading || permissionsLoading) ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse"></div>
                                        <div className="h-10 w-full bg-slate-800/30 rounded-xl animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            Object.entries(
                                allowedNavItems.reduce((acc, item) => {
                                    if (!acc[item.category]) acc[item.category] = [];
                                    acc[item.category].push(item);
                                    return acc;
                                }, {} as Record<string, typeof allowedNavItems>)
                            ).map(([category, items]) => (
                            <div key={category}>
                                <h3 className={cn("px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider sidebar-text mb-2 border-b border-slate-800/30 pb-2", isCollapsed && "lg:hidden")}>
                                    {category}
                                </h3>
                                <div className="space-y-1">
                                    {items.map(({ href, label, icon: Icon, badge }) => {
                                        const isActive = pathname === href;

                                        return (
                                            <Link 
                                                key={href} 
                                                href={href}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative sidebar-nav-item block w-full",
                                                    isCollapsed && "lg:justify-center lg:px-2 lg:mx-1",
                                                    isActive 
                                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 border border-blue-500/20 sidebar-nav-active" 
                                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-700/30 border border-transparent"
                                                )}
                                                title={isCollapsed ? label : undefined}
                                                onClick={(e) => {
                                                    // Ensure navigation works by preventing event conflicts
                                                    e.stopPropagation();
                                                    // Close mobile menu on navigation
                                                    if (isOpen) {
                                                        setIsOpen(false);
                                                    }
                                                }}
                                                onTouchEnd={(e) => {
                                                    // Prevent touch conflicts on mobile
                                                    e.stopPropagation();
                                                }}
                                                style={{touchAction: 'manipulation'}}
                                            >
                                                    <Icon className={cn(
                                                        "h-5 w-5 flex-shrink-0 transition-all duration-200",
                                                        isActive ? "text-white drop-shadow-sm" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
                                                    )} />
                                                    <span className={cn("truncate flex-1", isCollapsed && "lg:hidden")}>{label}</span>
                                                    {badge && !isCollapsed && (
                                                        <span className={cn(
                                                            "px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-200",
                                                            badge === 'AI' 
                                                                ? "bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
                                                                : "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm"
                                                        )}>
                                                            {badge}
                                                        </span>
                                                    )}
                                                    {badge && isCollapsed && (
                                                        <div className="hidden lg:block absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full shadow-lg" />
                                                    )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                        )}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800/30 sidebar-border">
                    {loading ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 loading-enhanced rounded-full flex-shrink-0"></div>
                                <div className="min-w-0 flex-1">
                                    <div className="h-4 w-16 loading-enhanced rounded mb-1"></div>
                                    <div className="h-3 w-12 loading-enhanced rounded"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={cn("flex items-center", isCollapsed ? "lg:justify-center lg:flex-col lg:gap-2" : "justify-between")}>
                            {/* Collapsed state: Center avatar with logout on click */}
                            {isCollapsed ? (
                                <div className="hidden lg:flex flex-col items-center gap-2">
                                    <div 
                                        className="relative group cursor-pointer"
                                        onClick={handleSignOut}
                                        title={`${getDisplayName()} - Click to sign out`}
                                    >
                                        {user?.avatar_url ? (
                                            <Image 
                                                src={user.avatar_url} 
                                                alt="User avatar"
                                                width={32}
                                                height={32}
                                                className="rounded-full ring-2 ring-slate-700/50 shadow-lg group-hover:ring-blue-500/50 transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-500/20 group-hover:ring-blue-500/50 transition-all duration-200">
                                                <span className="text-white text-xs font-bold">
                                                    {user ? getUserInitials(getDisplayName()) : 'U'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <LogOut className="h-2 w-2 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Expanded state: Normal layout */
                                <>
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {user?.avatar_url ? (
                                            <div className="relative">
                                                <Image 
                                                    src={user.avatar_url} 
                                                    alt="User avatar"
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full flex-shrink-0 ring-2 ring-slate-700/50 shadow-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-blue-500/20">
                                                <span className="text-white text-sm font-bold">
                                                    {user ? getUserInitials(getDisplayName()) : 'U'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-200 truncate sidebar-text" title={getDisplayName()}>
                                                {getDisplayName()}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate sidebar-text-secondary font-medium" title={user?.email}>
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
                                </>
                            )}
                            
                            {/* Mobile: Always show normal layout */}
                            <div className="lg:hidden flex items-center gap-3 min-w-0 flex-1">
                                {user?.avatar_url ? (
                                    <div className="relative">
                                        <Image 
                                            src={user.avatar_url} 
                                            alt="User avatar"
                                            width={36}
                                            height={36}
                                            className="rounded-full flex-shrink-0 ring-2 ring-slate-700/50 shadow-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-blue-500/20">
                                        <span className="text-white text-sm font-bold">
                                            {user ? getUserInitials(getDisplayName()) : 'U'}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-200 truncate sidebar-text" title={getDisplayName()}>
                                        {getDisplayName()}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate sidebar-text-secondary font-medium" title={user?.email}>
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="lg:hidden text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 flex-shrink-0 ml-2 transition-all duration-200 rounded-lg"
                                onClick={handleSignOut}
                                title="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    
                    <div className={cn("mt-4 pt-3 border-t border-slate-800/40 text-center text-xs text-slate-600 sidebar-text-muted font-medium", isCollapsed && "lg:hidden")}>
                        © 2025 Summit Automation
                    </div>
                    {/* Collapsed state: Show minimal copyright */}
                    <div className={cn("mt-2 pt-2 border-t border-slate-800/40 text-center text-xs text-slate-600 sidebar-text-muted font-medium hidden", isCollapsed && "lg:block")}>
                        © &apos;25
                    </div>
                </div>
            </aside>
        </>
    );
}