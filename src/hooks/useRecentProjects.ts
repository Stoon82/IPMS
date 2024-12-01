import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../services/projects';
import { Project } from '../types/project';

export const useRecentProjects = (limit: number = 5) => {
    const { data: projects = [], isLoading, error } = useQuery<Project[]>({
        queryKey: ['projects', 'recent', limit],
        queryFn: () => getProjects({
            limit,
            sort_by: 'updated_at',
            sort_order: 'desc'
        })
    });

    return {
        recentProjects: projects,
        isLoading,
        error
    };
};
