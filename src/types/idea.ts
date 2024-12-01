export interface Tag {
    id: number;
    name: string;
}

export interface Idea {
    id: number;
    title: string;
    description: string;
    status: 'draft' | 'in_progress' | 'implemented' | 'archived';
    created_at: string;
    updated_at: string;
    user_id: number;
    tags: Tag[];
}

export interface IdeaCreate {
    title: string;
    description: string;
    status?: 'draft' | 'in_progress' | 'implemented' | 'archived';
    tags: string[];
}

export interface IdeaUpdate {
    title?: string;
    description?: string;
    status?: 'draft' | 'in_progress' | 'implemented' | 'archived';
    tags?: string[];
}
