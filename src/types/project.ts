export enum ProjectStatus {
    PLANNING = "planning",
    ACTIVE = "active",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export enum ProjectPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

export interface Project {
    id: number;
    title: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    progress: number;
    target_start_date?: Date;
    target_end_date?: Date;
    actual_start_date?: Date;
    actual_end_date?: Date;
    budget?: number;
    owner_id: number;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface ProjectCreate {
    title: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    target_start_date?: Date;
    target_end_date?: Date;
    budget?: number;
    tags?: string[];
}

export interface ProjectUpdate extends Partial<ProjectCreate> {
    id: number;
    progress?: number;
    actual_start_date?: Date;
    actual_end_date?: Date;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNING]: "Planning",
    [ProjectStatus.ACTIVE]: "Active",
    [ProjectStatus.ON_HOLD]: "On Hold",
    [ProjectStatus.COMPLETED]: "Completed",
    [ProjectStatus.CANCELLED]: "Cancelled",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    [ProjectStatus.PLANNING]: "info",
    [ProjectStatus.ACTIVE]: "primary",
    [ProjectStatus.ON_HOLD]: "warning",
    [ProjectStatus.COMPLETED]: "success",
    [ProjectStatus.CANCELLED]: "error",
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
    [ProjectPriority.LOW]: "Low",
    [ProjectPriority.MEDIUM]: "Medium",
    [ProjectPriority.HIGH]: "High",
};

export const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    [ProjectPriority.LOW]: "success",
    [ProjectPriority.MEDIUM]: "warning",
    [ProjectPriority.HIGH]: "error",
};
