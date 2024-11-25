import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const UserProfileCard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    if (!user) return null;

    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar 
                        sx={{ 
                            width: 64, 
                            height: 64,
                            bgcolor: 'primary.main',
                            fontSize: '1.5rem'
                        }}
                    >
                        {user.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">
                            {user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" gap={1}>
                    <Button 
                        variant="outlined" 
                        fullWidth 
                        onClick={handleProfileClick}
                    >
                        View Profile
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        fullWidth 
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
