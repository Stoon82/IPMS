import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  Menu,
  MenuItem,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Task, TaskUpdate } from '../../types/task';
import { Project } from '../../types/project';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../../services/projects';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: number, data: TaskUpdate) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  isUpdating,
  isDeleting,
}) => {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  const getStatusColor = (status: Task['status']): 'default' | 'primary' | 'success' => {
    switch (status) {
      case 'todo':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Task['priority']): 'info' | 'warning' | 'error' | 'default' => {
    switch (priority) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProjectTitle = (projectId: number | null) => {
    if (!projectId) return null;
    const project = projects.find((p: Project) => p.id === projectId);
    return project?.title;
  };

  if (tasks.length === 0) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body1" align="center">
          No tasks found. Create a new task to get started!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2}>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id} divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="div">
                  {task.title}
                </Typography>
                {task.project_id && (
                  <Chip
                    icon={<FolderIcon />}
                    label={getProjectTitle(task.project_id)}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              
              {task.description && (
                <Typography variant="body2" color="text.secondary">
                  {task.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={task.status}
                  color={getStatusColor(task.status)}
                  size="small"
                />
                <Chip
                  label={task.priority}
                  color={getPriorityColor(task.priority)}
                  size="small"
                />
                {task.due_date && (
                  <Chip
                    label={format(new Date(task.due_date), 'PPp')}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => onUpdateTask(task.id, {} as TaskUpdate)}
                disabled={isUpdating}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDeleteTask(task.id)}
                disabled={isDeleting}
              >
                <DeleteIcon />
              </IconButton>
              {task.status !== 'done' && (
                <IconButton
                  edge="end"
                  aria-label="complete"
                  onClick={() => onUpdateTask(task.id, { status: 'done' } as TaskUpdate)}
                  disabled={isUpdating}
                  color="success"
                >
                  <CheckCircleIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
