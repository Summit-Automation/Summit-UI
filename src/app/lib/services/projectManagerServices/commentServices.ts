'use server';

import { TaskComment, TaskCommentWithUser } from '@/types/task';
import { getAuthenticatedUser } from '../shared/authUtils';

export interface CreateCommentData {
    task_id: string;
    content: string;
}

export async function createComment(commentData: CreateCommentData): Promise<TaskComment> {
    try {
        const { supabase, organizationId, user } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_task_comments')
            .insert({
                ...commentData,
                organization_id: organizationId,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating comment:', error);
            throw new Error('Failed to create comment');
        }

        return data;
    } catch (error) {
        console.error('Error in createComment:', error);
        throw error;
    }
}

export async function getComments(taskId: string): Promise<TaskCommentWithUser[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_task_comments')
            .select('*')
            .eq('task_id', taskId)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            throw new Error('Failed to fetch comments');
        }

        // For now, return basic data without user info (we'll add this back later)
        const transformedData: TaskCommentWithUser[] = (data || []).map((comment) => ({
            ...comment,
            user_email: '',
            user_name: 'Current User',
        }));

        return transformedData;
    } catch (error) {
        console.error('Error in getComments:', error);
        throw error;
    }
}

export async function updateComment(commentId: string, content: string): Promise<TaskComment> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_task_comments')
            .update({ content })
            .eq('id', commentId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) {
            console.error('Error updating comment:', error);
            throw new Error('Failed to update comment');
        }

        return data;
    } catch (error) {
        console.error('Error in updateComment:', error);
        throw error;
    }
}

export async function deleteComment(commentId: string): Promise<void> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { error } = await supabase
            .from('pm_task_comments')
            .delete()
            .eq('id', commentId)
            .eq('organization_id', organizationId);

        if (error) {
            console.error('Error deleting comment:', error);
            throw new Error('Failed to delete comment');
        }
    } catch (error) {
        console.error('Error in deleteComment:', error);
        throw error;
    }
}