export interface Profile {
    id: number;
    user_id: number;
    full_name: string | null;
    bio: string | null;
    theme_preference: string;
    notification_preferences: string;
    timezone: string;
}

export interface ProfileUpdateData {
    full_name?: string;
    bio?: string;
    theme_preference?: string;
    notification_preferences?: string;
    timezone?: string;
}
