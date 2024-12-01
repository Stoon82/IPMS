import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Box,
    Typography,
    Paper,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Project, ProjectStatus } from '../../types/project';

interface ProjectListProps {
    projects: Project[];
    onEditProject: (project: Project) => void;
    onDeleteProject: (id: number) => void;
    isDeleting: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({
    projects,
    onEditProject,
    onDeleteProject,
    isDeleting,
}) => {
    const navigate = useNavigate();

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

    if (projects.length === 0) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography align="center" color="textSecondary">
                    No projects found
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2}>
            <List>
                {projects.map((project) => (
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" component="div">
                                    {project.title}
                                </Typography>
                                <Chip
                                    label={project.status.replace('_', ' ').toUpperCase()}
                                    color={getStatusColor(project.status)}
                                    size="small"
                                />
                            </Box>

                            {project.description && (
                                <Typography variant="body2" color="text.secondary">
                                    {project.description}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography variant="caption" color="textSecondary">
                                    Created: {format(new Date(project.created_at), 'PPp')}
                                </Typography>
                                {project.target_end_date && (
                                    <Typography variant="caption" color="textSecondary">
                                        Target: {format(new Date(project.target_end_date), 'PPp')}
                                    </Typography>
                                )}
                                {project.actual_end_date && (
                                    <Typography variant="caption" color="textSecondary">
                                        Completed: {format(new Date(project.actual_end_date), 'PPp')}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                aria-label="view"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/projects/${project.id}`);
                                }}
                            >
                                <OpenInNewIcon />
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-label="edit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditProject(project);
                                }}
                                sx={{ ml: 1 }}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={() => onDeleteProject(project.id)} disabled={isDeleting}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};
