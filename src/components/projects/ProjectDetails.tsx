import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    TextField,
    Grid,
    Chip,
    Stack,
    LinearProgress,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { Project, ProjectStatus, ProjectPriority, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, PROJECT_PRIORITY_LABELS, PROJECT_PRIORITY_COLORS } from '../../types/project';
import { Mindmap } from '../../types/mindmap';
import { updateProject, deleteProject, updateProjectProgress, getProject } from '../../services/projects';
import { TeamManagement } from './TeamManagement';
import { ActivityTimeline } from './ActivityTimeline';

interface ProjectDetailsProps {
    id?: string;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Partial<Project>>({
        title: '',
        description: '',
        status: ProjectStatus.PLANNING,
        priority: ProjectPriority.LOW,
        target_start_date: undefined,
        target_end_date: undefined,
        budget: undefined,
        tags: [],
    });

    // Fetch project data
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: () => getProject(Number(id)),
        enabled: !!id,
    });

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title,
                description: project.description,
                status: project.status,
                priority: project.priority,
                target_start_date: project.target_start_date ? new Date(project.target_start_date) : undefined,
                target_end_date: project.target_end_date ? new Date(project.target_end_date) : undefined,
                budget: project.budget,
                tags: project.tags,
            });
        }
    }, [project]);

    const progressMutation = useMutation({
        mutationFn: (newProgress: number) => {
            if (!project?.id) throw new Error('Project ID is required');
            return updateProjectProgress(project.id, newProgress);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (projectId: number) => deleteProject(projectId),
        onSuccess: () => {
            navigate('/projects');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Project> & { id: number }) => updateProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (project?.id) {
            updateMutation.mutate({
                id: project.id,
                ...formData,
            });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this project?') && project?.id) {
            deleteMutation.mutate(project.id);
        }
    };

    const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = parseInt(event.target.value);
        if (!isNaN(newProgress) && project?.id) {
            progressMutation.mutate(newProgress);
        }
    };

    return (
        <Box p={3}>
            {isLoading ? (
                <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress />
                </Box>
            ) : project ? (
                <>
                    <Box mb={4}>
                        <Typography variant="h4" gutterBottom>
                            {project.title}
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                            <Chip
                                label={project.status ? PROJECT_STATUS_LABELS[project.status] : ''}
                                color={project.status ? PROJECT_STATUS_COLORS[project.status] : 'default'}
                                size="small"
                            />
                            <Chip
                                label={project.priority ? PROJECT_PRIORITY_LABELS[project.priority] : ''}
                                color={project.priority ? PROJECT_PRIORITY_COLORS[project.priority] : 'default'}
                                size="small"
                            />
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Target Start Date
                                </Typography>
                                <Typography>
                                    {project.target_start_date
                                        ? format(new Date(project.target_start_date), 'MMM d, yyyy')
                                        : 'Not set'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Target End Date
                                </Typography>
                                <Typography>
                                    {project.target_end_date
                                        ? format(new Date(project.target_end_date), 'MMM d, yyyy')
                                        : 'Not set'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box mb={4}>
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>
                        <Typography>{project.description}</Typography>
                    </Box>

                    <Box mb={4}>
                        <Typography variant="h6" gutterBottom>
                            Progress
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{ flexGrow: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                {project.progress}%
                            </Typography>
                        </Box>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as ProjectStatus,
                                            })
                                        }
                                        label="Status"
                                    >
                                        {Object.values(ProjectStatus).map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {PROJECT_STATUS_LABELS[status]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={formData.priority}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                priority: e.target.value as ProjectPriority,
                                            })
                                        }
                                        label="Priority"
                                    >
                                        {Object.values(ProjectPriority).map((priority) => (
                                            <MenuItem key={priority} value={priority}>
                                                {PROJECT_PRIORITY_LABELS[priority]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Target Start Date"
                                    value={formData.target_start_date}
                                    onChange={(date: Date | null) =>
                                        setFormData({
                                            ...formData,
                                            target_start_date: date || undefined,
                                        })
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: 'outlined',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Target End Date"
                                    value={formData.target_end_date}
                                    onChange={(date: Date | null) =>
                                        setFormData({
                                            ...formData,
                                            target_end_date: date || undefined,
                                        })
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: 'outlined',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Budget"
                                    value={formData.budget || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            budget: parseFloat(e.target.value),
                                        })
                                    }
                                />
                            </Grid>
                        </Grid>
                    </form>

                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>
                            Team Members
                        </Typography>
                        <TeamManagement projectId={project.id} />
                    </Box>

                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>
                            Activity Timeline
                        </Typography>
                        <ActivityTimeline projectId={project.id} />
                    </Box>

                    {project.tags && project.tags.length > 0 && (
                        <Box mt={3}>
                            <Typography variant="subtitle2" gutterBottom>
                                Tags
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {project.tags.map((tag) => (
                                    <Chip key={tag} label={tag} size="small" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Box mt={4} display="flex" justifyContent="flex-end">
                        <IconButton color="error" onClick={handleDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </>
            ) : (
                <Typography>Loading...</Typography>
            )}
        </Box>
    );
};
