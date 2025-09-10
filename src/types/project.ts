// types/project.ts
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Project = {
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date?: string;
    due_date?: string;
    created_by: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
};

export type ProjectWithStats = Project & {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    total_hours_logged: number;
    total_estimated_hours: number;
};