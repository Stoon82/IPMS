import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, Task, User } from '../types';

// API routes configuration
const API_ROUTES = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
        PROFILE: '/api/auth/profile'
    },
    TASKS: {
        BASE: '/api/tasks',
        STATS: '/api/tasks/stats',
    }
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',  // Default to localhost if env var not set
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Required for cookies
    timeout: 30000, // 30 seconds
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// Extended type for request config with _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Add request interceptor for authentication and debugging
api.interceptors.request.use(
    (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Log request details in development only
        if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', {
                method: config.method?.toUpperCase(),
                url: `${config.baseURL || ''}${config.url || ''}`,
                headers: config.headers,
            });
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging and token refresh
api.interceptors.response.use(
    (response) => {
        // Log response in development only
        if (process.env.NODE_ENV === 'development') {
            console.log('API Response:', {
                status: response.status,
                url: response.config.url,
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        
        // Don't retry if:
        // 1. This is already a retry
        // 2. No originalRequest exists
        // 3. This is an auth endpoint (except profile)
        if (
            !originalRequest || 
            originalRequest._retry || 
            (originalRequest.url?.startsWith('/api/auth/') && originalRequest.url !== '/api/auth/profile')
        ) {
            return Promise.reject(error);
        }

        // Only attempt refresh on 401 errors
        if (error.response?.status === 401) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                // Try to refresh the token
                const response = await auth.refreshToken(refreshToken);
                
                // Store new tokens
                localStorage.setItem('token', response.access_token);
                if (response.refresh_token) {
                    localStorage.setItem('refresh_token', response.refresh_token);
                }
                
                // Update the authorization header
                originalRequest.headers['Authorization'] = `Bearer ${response.access_token}`;
                
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Clear tokens and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// API functions
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    console.log('Sending registration request with data:', data);
    try {
        const response = await api.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        console.log('Response data:', (error as AxiosError)?.response?.data);
        console.log('Response status:', (error as AxiosError)?.response?.status);
        console.log('Response headers:', (error as AxiosError)?.response?.headers);
        throw error;
    }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);
    return response.data;
};

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(API_ROUTES.AUTH.REFRESH, { refresh_token: refreshToken });
    return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
    const response = await api.get<Task[]>(API_ROUTES.TASKS.BASE);
    return response.data;
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
    const response = await api.post<Task>(API_ROUTES.TASKS.BASE, task);
    return response.data;
};

export const updateTask = async (taskId: number, task: Partial<Task>): Promise<Task> => {
    const response = await api.put<Task>(`${API_ROUTES.TASKS.BASE}/${taskId}`, task);
    return response.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
    await api.delete(`${API_ROUTES.TASKS.BASE}/${taskId}`);
};

export const getTaskStats = async (): Promise<any> => {
    const response = await api.get(API_ROUTES.TASKS.STATS);
    return response.data;
};

export const auth = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);
        return response.data;
    },

    register(data: RegisterData): Promise<AuthResponse> {
        return api.post(API_ROUTES.AUTH.REGISTER, data).then(response => response.data);
    },

    getProfile(): Promise<User> {
        return api.get(API_ROUTES.AUTH.PROFILE).then(response => response.data);
    },

    logout(): Promise<void> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            // If no refresh token, just clear local storage and return
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            return Promise.resolve();
        }
        return api.post(API_ROUTES.AUTH.LOGOUT, { refresh_token: refreshToken })
            .then(response => {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                return response.data;
            })
            .catch(error => {
                // Still clear tokens even if request fails
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                throw error;
            });
    },

    refreshToken(refreshToken: string): Promise<AuthResponse> {
        return api.post(API_ROUTES.AUTH.REFRESH, { refresh_token: refreshToken }).then(response => response.data);
    }
};

export const tasks = {
    getAll: async (): Promise<Task[]> => {
        const response = await api.get<Task[]>(API_ROUTES.TASKS.BASE);
        return response.data;
    },

    getById: async (id: number): Promise<Task> => {
        const response = await api.get<Task>(`${API_ROUTES.TASKS.BASE}/${id}`);
        return response.data;
    },

    create: async (task: Partial<Task>): Promise<Task> => {
        const response = await api.post<Task>(API_ROUTES.TASKS.BASE, task);
        return response.data;
    },

    update: async (id: number, task: Partial<Task>): Promise<Task> => {
        const response = await api.put<Task>(`${API_ROUTES.TASKS.BASE}/${id}`, task);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API_ROUTES.TASKS.BASE}/${id}`);
    },
};

export const apiClient = api;
