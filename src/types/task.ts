// types/task.ts
export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Task = {
    id: string;
    project_id: string;
    organization_id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigned_to?: string;
    due_date?: string;
    estimated_hours?: number;
    actual_hours: number;
    created_by: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
};

export type TaskWithDetails = Task & {
    project_name: string;
    project_status: string;
    assigned_to_email?: string;
    assigned_to_name?: string;
    created_by_email: string;
    created_by_name?: string;
    time_entry_count: number;
    comment_count: number;
};

export type TimeEntry = {
    id: string;
    task_id: string;
    organization_id: string;
    user_id: string;
    minutes: number;
    description: string;
    entry_date: string;
    created_at: string;
    updated_at: string;
};

export type TaskComment = {
    id: string;
    task_id: string;
    organization_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export type TaskCommentWithUser = TaskComment & {
    user_email: string;
    user_name?: string;
};

export type TimeEntryWithUser = TimeEntry & {
    user_email: string;
    user_name?: string;
};