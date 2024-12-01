import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Profile, ProfileUpdateData } from '../types/profile';
import { AxiosResponse } from 'axios';

export const useProfile = () => {
    const queryClient = useQueryClient();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiClient.get<Profile>('/api/profile').then((response: AxiosResponse<Profile>) => response.data),
    });

    const updateProfile = useMutation({
        mutationFn: (updateData: ProfileUpdateData) => 
            apiClient.put<Profile>('/api/profile', updateData)
                .then((response: AxiosResponse<Profile>) => response.data),
        onSuccess: (data) => {
            queryClient.setQueryData(['profile'], data);
        },
    });

    return {
        profile,
        isLoading,
        error,
        updateProfile: updateProfile.mutate,
        isUpdating: updateProfile.isPending,
        updateError: updateProfile.error,
    };
};
