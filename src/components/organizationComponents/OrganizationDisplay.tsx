'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { getCurrentUserOrganization } from '@/app/lib/services/organizationServices/getCurrentOrganization';

type Organization = {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
};

export default function OrganizationDisplay() {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrganization();
    }, []);

    const loadOrganization = async () => {
        try {
            const org = await getCurrentUserOrganization();
            setOrganization(org);
        } catch (error) {
            console.error('Failed to load organization:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Building2 className="h-4 w-4 animate-pulse" />
                <span>Loading...</span>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Building2 className="h-4 w-4" />
                <span>No organization assigned</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span className="font-medium">{organization.name}</span>
        </div>
    );
}