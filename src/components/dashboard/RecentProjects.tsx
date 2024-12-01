import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    OpenInNew as OpenInNewIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getProjects } from '../../services/projects';
import { Project, ProjectStatus } from '../../types/project';

export const RecentProjects: React.FC = () => {
    const navigate = useNavigate();
    const { data: recentProjects = [], isLoading, error } = useQuery<Project[]>({
        queryKey: ['projects', { recent: true }],
        queryFn: () => getProjects({ sort_by: 'updated_at' }),
    });

    const getStatusColor = (status: ProjectStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
        switch (status) {
            case 'planning':
                return 'default';
            case 'active':
                return 'primary';
            case 'on_hold':
                return 'warning';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Error loading recent projects
            </Alert>
        );
    }

    if (recentProjects.length === 0) {
        return (
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="body1" align="center" color="textSecondary">
                    No recent projects
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ mt: 2 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" component="h2">
                    Recent Projects
                </Typography>
            </Box>
            <List>
                {recentProjects.map((project) => (
                    <ListItem
                        key={project.id}
                        divider
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                        }}
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1">
                                        {project.title}
                                    </Typography>
                                    <Chip
                                        label={project.status.replace('_', ' ').toUpperCase()}
                                        color={getStatusColor(project.status)}
                                        size="small"
                                    />
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" color="textSecondary">
                                    Last updated: {format(new Date(project.updated_at), 'PPp')}
                                </Typography>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/projects/${project.id}`);
                                }}
                            >
                                <OpenInNewIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};
