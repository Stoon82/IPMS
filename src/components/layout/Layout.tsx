import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Home as HomeIcon,
    Task as TaskIcon,
    Folder as ProjectIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    Lightbulb as IdeaIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <HomeIcon /> },
        { path: '/projects', label: 'Projects', icon: <ProjectIcon /> },
        { path: '/tasks', label: 'Tasks', icon: <TaskIcon /> },
        { path: '/ideas', label: 'Ideas', icon: <IdeaIcon /> },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
                elevation={1}
            >
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        IPMS
                    </Typography>
                    {user && (
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            Welcome, {user.username}
                        </Typography>
                    )}
                    <IconButton 
                        color="inherit" 
                        aria-label="user profile"
                        onClick={() => navigate('/profile')}
                        sx={{
                            mr: 2,
                            backgroundColor: isActive('/profile')
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'transparent',
                        }}
                    >
                        <PersonIcon />
                    </IconButton>
                    <IconButton 
                        color="inherit" 
                        onClick={handleLogout}
                        aria-label="logout"
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {navItems.map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    selected={isActive(item.path)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: isActive(item.path)
                                                ? 'primary.main'
                                                : 'inherit',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};
