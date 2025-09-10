'use server';

import { Project, ProjectWithStats } from '@/types/project';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function getProjects(): Promise<Project[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_projects')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            throw new Error('Failed to fetch projects');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getProjects:', error);
        throw error;
    }
}

export async function getProjectsWithStats(): Promise<ProjectWithStats[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_projects_with_stats')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects with stats:', error);
            throw new Error('Failed to fetch projects with stats');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getProjectsWithStats:', error);
        throw error;
    }
}

export async function getProject(projectId: string): Promise<Project | null> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_projects')
            .select('*')
            .eq('id', projectId)
            .eq('organization_id', organizationId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows found
            }
            console.error('Error fetching project:', error);
            throw new Error('Failed to fetch project');
        }

        return data;
    } catch (error) {
        console.error('Error in getProject:', error);
        throw error;
    }
}