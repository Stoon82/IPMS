import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectTasks, createTask, updateTask, deleteTask } from '../../services/tasks';
import { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '../../types/task';
import { format } from 'date-fns';

interface ProjectTasksProps {
    projectId: number;
    filters?: {
        status?: TaskStatus;
        priority?: TaskPriority;
        search: string;
    };
}

interface TaskFormData {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
}

const initialFormData: TaskFormData = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
};

const statusColors: Record<TaskStatus, 'default' | 'warning' | 'success'> = {
    todo: 'default',
    in_progress: 'warning',
    done: 'success',
};

const priorityColors: Record<TaskPriority, 'default' | 'info' | 'error'> = {
    low: 'default',
    medium: 'info',
    high: 'error',
};

export const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId, filters = { search: '' } }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<TaskFormData>(initialFormData);

    const queryClient = useQueryClient();
    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ['tasks', projectId],
        queryFn: () => getProjectTasks(projectId)
    });

    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter((task: Task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                (task.description?.toLowerCase() || '').includes(filters.search.toLowerCase());
            
            const matchesStatus = !filters.status || task.status === filters.status;
            const matchesPriority = !filters.priority || task.priority === filters.priority;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, filters]);

    const createMutation = useMutation({
        mutationFn: (taskData: TaskCreate) => createTask(taskData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            handleCloseForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: TaskUpdate) => updateTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            handleCloseForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        },
    });

    const handleOpenForm = (task?: Task) => {
        if (task) {
            setSelectedTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date,
            });
        } else {
            setSelectedTask(null);
            setFormData(initialFormData);
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedTask(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const taskData = {
            ...formData,
            project_id: projectId,
        };

        if (selectedTask) {
            updateMutation.mutate({ id: selectedTask.id, ...taskData } as TaskUpdate);
        } else {
            createMutation.mutate({ ...taskData, project_id: projectId } as TaskCreate);
        }
    };

    const handleDelete = (task: Task) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteMutation.mutate(task.id);
        }
    };

    if (isLoading) {
        return <Typography>Loading tasks...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                >
                    Add Task
                </Button>
            </Box>

            <List>
                {filteredTasks.map((task) => (
                    <ListItem
                        key={task.id}
                        sx={{
                            mb: 1,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                        }}
                    >
                        <ListItemText
                            primary={task.title}
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {task.description}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <Chip
                                            label={task.status}
                                            size="small"
                                            color={statusColors[task.status]}
                                        />
                                        <Chip
                                            label={task.priority}
                                            size="small"
                                            color={priorityColors[task.priority]}
                                        />
                                        {task.due_date && (
                                            <Chip
                                                label={format(new Date(task.due_date), 'MMM d, yyyy')}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                aria-label="edit"
                                onClick={() => handleOpenForm(task)}
                                sx={{ mr: 1 }}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDelete(task)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
                {filteredTasks.length === 0 && (
                    <Typography color="text.secondary" align="center" py={4}>
                        No tasks found. {filters.search || filters.status || filters.priority
                            ? 'Try adjusting your filters.'
                            : 'Create a new task to get started.'}
                    </Typography>
                )}
            </List>

            <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {selectedTask ? 'Edit Task' : 'New Task'}
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} pt={1}>
                            <TextField
                                label="Title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                fullWidth
                                required
                            />
                            <TextField
                                label="Description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                multiline
                                rows={4}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value as TaskStatus,
                                        })
                                    }
                                    label="Status"
                                >
                                    <MenuItem value="todo">To Do</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="done">Done</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={formData.priority}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            priority: e.target.value as TaskPriority,
                                        })
                                    }
                                    label="Priority"
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                </Select>
                            </FormControl>
                            <DatePicker
                                label="Due Date"
                                value={formData.due_date ? new Date(formData.due_date) : null}
                                onChange={(date) =>
                                    setFormData({
                                        ...formData,
                                        due_date: date ? date.toISOString() : undefined,
                                    })
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseForm}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedTask ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};
