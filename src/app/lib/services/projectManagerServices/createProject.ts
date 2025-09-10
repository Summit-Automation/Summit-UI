'use server';

import { Project } from '@/types/project';
import { getAuthenticatedUser } from '../shared/authUtils';
import { createProjectSchema, CreateProjectInput } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';
import { Result, success, error as createError } from '@/types/result';

export type CreateProjectData = CreateProjectInput;

export async function createProject(input: unknown): Promise<Result<Project, string>> {
    // Validate input
    const validationResult = validateInput(createProjectSchema, input);
    if (!validationResult.success) {
        return createError(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase, organizationId, user } = await getAuthenticatedUser();

        // Create project with validated fields
        const projectToInsert = {
            name: validatedInput.name,
            description: validatedInput.description || null,
            status: validatedInput.status,
            priority: validatedInput.priority,
            start_date: validatedInput.start_date || null,
            due_date: validatedInput.due_date || null,
            organization_id: organizationId,
            created_by: user.id,
            updated_by: user.id,
        };

        const { data, error } = await supabase
            .from('pm_projects')
            .insert(projectToInsert)
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return createError('Failed to create project');
        }

        return success(data);
    } catch (err) {
        console.error('Exception in createProject:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}