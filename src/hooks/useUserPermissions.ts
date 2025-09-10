'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LucideProps } from 'lucide-react';

export interface UserPermissions {
    dashboard: boolean;
    crm: boolean;
    bookkeeper: boolean;
    mileage: boolean;
    inventory: boolean;
    leadgen: boolean;
    project_manager: boolean;
    [key: string]: boolean;
}

export function useUserPermissions() {
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const supabase = createClient();
                
                // Get current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    throw new Error('User not authenticated');
                }

                // Get organization ID from user metadata
                const organizationId = user.user_metadata?.organization_id;
                if (!organizationId) {
                    throw new Error('User organization not found');
                }

                // Fetch user permissions from database
                const { data: permissionsData, error: permissionsError } = await supabase
                    .from('user_permissions')
                    .select('permission_name, granted')
                    .eq('user_id', user.id)
                    .eq('organization_id', organizationId);

                if (permissionsError) {
                    console.error('Error fetching permissions:', permissionsError);
                    // If no permissions found, default to project_manager only for employees
                    setPermissions({
                        dashboard: false,
                        crm: false,
                        bookkeeper: false,
                        mileage: false,
                        inventory: false,
                        leadgen: false,
                        project_manager: true, // Default access for all org members
                    });
                } else {
                    // Convert permissions array to object
                    const permissionsObj: UserPermissions = {
                        dashboard: false,
                        crm: false,
                        bookkeeper: false,
                        mileage: false,
                        inventory: false,
                        leadgen: false,
                        project_manager: true, // Default access for all org members
                    };

                    // Set granted permissions
                    permissionsData?.forEach(perm => {
                        if (perm.granted && perm.permission_name in permissionsObj) {
                            permissionsObj[perm.permission_name] = true;
                        }
                    });

                    setPermissions(permissionsObj);
                }
            } catch (err) {
                console.error('Error in useUserPermissions:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Default permissions on error - project manager only
                setPermissions({
                    dashboard: false,
                    crm: false,
                    bookkeeper: false,
                    mileage: false,
                    inventory: false,
                    leadgen: false,
                    project_manager: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    return { permissions, loading, error };
}

// Hook to check specific permission
export function useHasPermission(permissionName: string): boolean {
    const { permissions } = useUserPermissions();
    
    if (!permissions) return false;
    
    return permissions[permissionName] || false;
}

// Hook to get allowed navigation items based on permissions
export function useAllowedNavItems(navItems: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<LucideProps>;
    category: string;
    badge?: string;
}>) {
    const { permissions, loading } = useUserPermissions();

    if (loading || !permissions) {
        return { allowedItems: [], loading: true };
    }

    // Map nav items to their permission names
    const permissionMap: { [key: string]: string } = {
        '/': 'dashboard',
        '/crm': 'crm',
        '/bookkeeper': 'bookkeeper',
        '/mileage': 'mileage',
        '/inventory': 'inventory',
        '/leadgen': 'leadgen',
        '/project-manager': 'project_manager',
    };

    const allowedItems = navItems.filter(item => {
        const permissionName = permissionMap[item.href];
        return permissionName && permissions[permissionName];
    });

    return { allowedItems, loading: false };
}