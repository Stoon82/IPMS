export interface MindmapNode {
    id: string;
    text: string;
    children?: MindmapNode[];
    style?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
        x?: number;
        y?: number;
    };
}

export interface Mindmap {
    id: number;
    title: string;
    description?: string;
    project_id: number;
    data: MindmapNode;
    created_at: string;
    updated_at: string;
}

export interface MindmapCreate {
    title: string;
    description?: string;
    project_id: number;
    data: MindmapNode;
}

export interface MindmapUpdate {
    id: number;
    title?: string;
    description?: string;
    data?: MindmapNode;
}
