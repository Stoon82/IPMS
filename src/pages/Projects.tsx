import React from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ArrowBack } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectForm } from '../components/projects/ProjectForm';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projects';
import { Project, ProjectCreate as ProjectCreateData, ProjectUpdate as ProjectUpdateData, ProjectStatus } from '../types/project';

export const Projects: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFormOpen, setIsFormOpen] = React.useState(location.state?.openForm || false);
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | ''>('');
    const queryClient = useQueryClient();

    const { data: projects = [], isLoading, error } = useQuery({
        queryKey: ['projects', statusFilter],
        queryFn: () => getProjects(),
        select: (data) => statusFilter ? data.filter(p => p.status === statusFilter) : data
    });

    const { mutate: createProjectMutation, isPending: isCreating } = useMutation({
        mutationFn: (data: ProjectCreateData) => createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsFormOpen(false);
            setSelectedProject(null);
        },
    });

    const { mutate: updateProjectMutation, isPending: isUpdating } = useMutation({
        mutationFn: (data: ProjectUpdateData) => updateProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsFormOpen(false);
            setSelectedProject(null);
        },
    });

    const { mutate: deleteProjectMutation, isPending: isDeleting } = useMutation({
        mutationFn: (projectId: number) => deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const handleCreateProject = (data: ProjectCreateData) => {
        createProjectMutation(data);
    };

    const handleUpdateProject = (data: ProjectUpdateData) => {
        updateProjectMutation(data);
    };

    const handleDeleteProject = (projectId: number) => {
        deleteProjectMutation(projectId);
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedProject(null);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">Error loading projects</Alert>;
    }

    return (
        <Box>
            {isFormOpen ? (
                <>
                    <Box display="flex" alignItems="center" mb={3}>
                        <IconButton onClick={handleCloseForm} sx={{ mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5">
                            {selectedProject ? 'Edit Project' : 'Create New Project'}
                        </Typography>
                    </Box>
                    <ProjectForm
                        onSubmit={(data: ProjectCreateData | ProjectUpdateData) =>
                            selectedProject ? handleUpdateProject(data as ProjectUpdateData) : handleCreateProject(data as ProjectCreateData)
                        }
                        initialData={selectedProject || undefined}
                        isSubmitting={isCreating || isUpdating}
                        onCancel={handleCloseForm}
                        open={isFormOpen}
                    />
                </>
            ) : (
                <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5">Projects</Typography>
                        <Box display="flex" gap={2}>
                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="planning">Planning</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="on_hold">On Hold</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setIsFormOpen(true)}
                            >
                                New Project
                            </Button>
                        </Box>
                    </Box>
                    <ProjectList
                        projects={projects}
                        onEditProject={handleEditProject}
                        onDeleteProject={handleDeleteProject}
                        isDeleting={isDeleting}
                    />
                </>
            )}
        </Box>
    );
};
