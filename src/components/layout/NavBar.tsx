import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    Home as HomeIcon,
    Task as TaskIcon,
    Folder as ProjectIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const NavBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <HomeIcon /> },
        { path: '/projects', label: 'Projects', icon: <ProjectIcon /> },
        { path: '/tasks', label: 'Tasks', icon: <TaskIcon /> },
    ];

    return (
        <AppBar position="static" color="primary" elevation={1}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
                    IPMS
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                    {navItems.map((item) => (
                        <Button
                            key={item.path}
                            startIcon={item.icon}
                            onClick={() => navigate(item.path)}
                            sx={{
                                color: 'white',
                                backgroundColor: isActive(item.path)
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>
                <IconButton color="inherit" aria-label="user profile">
                    <PersonIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};
