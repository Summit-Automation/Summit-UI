'use server';

import { Project } from '@/types/project';
import { getAuthenticatedUser } from '../shared/authUtils';
import { updateProjectSchema, UpdateProjectInput } from '@/lib/validation/schemas';
import { validatePartialInput, formatValidationErrors } from '@/lib/validation/validator';
import { Result, success, error as createError } from '@/types/result';

export async function updateProject(projectId: string, input: unknown): Promise<Result<Project, string>> {
    // Validate projectId
    if (!projectId || typeof projectId !== 'string') {
        return createError('Invalid project ID');
    }

    // Validate input
    const validationResult = validatePartialInput<UpdateProjectInput>(updateProjectSchema, input);
    if (!validationResult.success) {
        return createError(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase, organizationId, user } = await getAuthenticatedUser();

        // First, verify the project exists and user has access
        const { data: existingProject, error: fetchError } = await supabase
            .from('pm_projects')
            .select('id, name')
            .eq('id', projectId)
            .eq('organization_id', organizationId)
            .single();

        if (fetchError || !existingProject) {
            return createError('Project not found or access denied');
        }

        // Build update object with validated fields
        const updateData: Record<string, string | number | null | undefined> = {
            ...validatedInput,
            updated_by: user.id,
        };

        // Convert empty strings to null for optional fields
        if (updateData.description === '') updateData.description = null;
        if (updateData.start_date === '') updateData.start_date = null;
        if (updateData.due_date === '') updateData.due_date = null;

        const { data, error } = await supabase
            .from('pm_projects')
            .update(updateData)
            .eq('id', projectId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) {
            console.error('Error updating project:', error);
            return createError('Failed to update project');
        }

        return success(data);
    } catch (err) {
        console.error('Exception in updateProject:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}

export async function deleteProject(projectId: string): Promise<Result<boolean, string>> {
    // Validate projectId
    if (!projectId || typeof projectId !== 'string') {
        return createError('Invalid project ID');
    }

    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        // First, verify the project exists and user has access
        const { data: existingProject, error: fetchError } = await supabase
            .from('pm_projects')
            .select('id, name')
            .eq('id', projectId)
            .eq('organization_id', organizationId)
            .single();

        if (fetchError || !existingProject) {
            return createError('Project not found or access denied');
        }

        // Delete the project (cascade should handle related tasks)
        const { error } = await supabase
            .from('pm_projects')
            .delete()
            .eq('id', projectId)
            .eq('organization_id', organizationId);

        if (error) {
            console.error('Error deleting project:', error);
            return createError('Failed to delete project');
        }

        return success(true);
    } catch (err) {
        console.error('Exception in deleteProject:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}