export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export type UserRole = 'admin' | 'manager' | 'member';

export interface UserSummary {
    id: number;
    username: string;
    full_name: string;
    avatar_url?: string;
    role: UserRole;
}

export type ActivityType = 
    | 'create'
    | 'update'
    | 'add_member'
    | 'remove_member'
    | 'add_task'
    | 'complete_task'
    | 'link'
    | 'unlink'
    | 'note';

export interface ProjectActivity {
    id: number;
    project_id: number;
    user_id: number;
    action_type: ActivityType;
    description: string;
    created_at: string;
    user: UserSummary;
    metadata?: Record<string, any>;
}
