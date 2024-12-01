import React from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    CircularProgress,
    Alert,
    IconButton,
} from '@mui/material';
import { Add as AddIcon, ArrowBack } from '@mui/icons-material';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskList } from '../components/tasks/TaskList';
import { TaskFilters } from '../components/tasks/TaskFilters';
import type { TaskFilters as TaskFiltersType } from '../components/tasks/TaskFilters';
import { Task, TaskCreate, TaskUpdate } from '../types/task';
import { useLocation, useNavigate } from 'react-router-dom';

export const Tasks: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFormOpen, setIsFormOpen] = React.useState(location.state?.openForm || false);
    const [filters, setFilters] = React.useState<TaskFiltersType>({});

    const {
        tasks,
        createTask,
        updateTask,
        deleteTask,
        isLoading,
        error,
        isCreating,
        isUpdating,
        isDeleting,
    } = useTasks(filters);

    const handleCreateTask = async (taskData: TaskCreate) => {
        if (!taskData.title) {
            return; // Don't create task if title is missing
        }
        await createTask({
            ...taskData,
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            due_date: taskData.due_date || undefined,
            project_id: taskData.project_id,
        });
        setIsFormOpen(false);
    };

    const handleUpdateTask = async (id: number, taskData: TaskUpdate) => {
        await updateTask({ id, data: taskData });
    };

    const handleDeleteTask = async (id: number) => {
        await deleteTask(id);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Error loading tasks. Please try again later.
            </Alert>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton
                        onClick={() => navigate('/')}
                        color="primary"
                        aria-label="return to dashboard"
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        Tasks
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenForm}
                >
                    New Task
                </Button>
            </Box>

            <TaskFilters
                filters={filters}
                onFiltersChange={setFilters}
            />

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TaskList
                        tasks={tasks || []}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        isUpdating={isUpdating}
                        isDeleting={isDeleting}
                    />
                </Grid>
            </Grid>

            <TaskForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateTask}
                isSubmitting={isCreating}
            />
        </Box>
    );
};
