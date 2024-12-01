export interface User {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    disabled?: boolean;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    created_at: string;
    updated_at: string;
    user_id: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    full_name?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_at: string;
}

export * from './idea';
export * from './profile';
export * from './project';
export * from './task';
