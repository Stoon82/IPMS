import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { User, LoginCredentials, RegisterData } from '../types';

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setLoading] = useState(true);
    const navigate = useNavigate();

    const clearAuthState = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const user = await auth.getProfile();
                setUser(user);
            } catch (error) {
                console.error('Auth check failed:', error);
                clearAuthState();
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate, clearAuthState]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            const response = await auth.login(credentials);
            
            // Store tokens
            localStorage.setItem('token', response.access_token);
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }

            // Get user profile
            const user = await auth.getProfile();
            setUser(user);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            clearAuthState();
            
            // Provide more specific error messages
            if (error.response?.status === 401) {
                throw new Error('Invalid username or password');
            } else if (error.response?.status === 422) {
                throw new Error('Please check your login credentials');
            } else {
                throw new Error('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, clearAuthState]);

    const register = useCallback(async (userData: RegisterData) => {
        try {
            setLoading(true);
            const response = await auth.register(userData);
            
            // Store tokens
            localStorage.setItem('token', response.access_token);
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }
            
            // Get user profile
            const user = await auth.getProfile();
            setUser(user);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Registration error:', error);
            clearAuthState();
            
            // Provide more specific error messages
            if (error.response?.status === 400) {
                throw new Error(error.response.data.detail || 'Username or email already exists');
            } else if (error.response?.status === 422) {
                throw new Error('Please check your registration details');
            } else {
                throw new Error('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, clearAuthState]);

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await auth.logout();
            clearAuthState();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, clear local state
            clearAuthState();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate, clearAuthState]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
