import React, { useState } from 'react';
import {
    Box,
    Typography,
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
    List,
    ListItem,
    ListItemText,
    IconButton,
    Paper,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { getProjectLogs, createProjectLog, updateProjectLog, deleteProjectLog } from '../../services/projectLogs';

interface LogFormData {
    title: string;
    content: string;
    log_type: string;
}

interface ProjectLogsProps {
    projectId: number;
}

export const ProjectLogs: React.FC<ProjectLogsProps> = ({ projectId }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [formData, setFormData] = useState<LogFormData>({
        title: '',
        content: '',
        log_type: 'progress',
    });

    const queryClient = useQueryClient();
    const { data: logs = [], isLoading } = useQuery(['projectLogs', projectId], () =>
        getProjectLogs(projectId)
    );

    const createMutation = useMutation(createProjectLog, {
        onSuccess: () => {
            queryClient.invalidateQueries(['projectLogs', projectId]);
            handleCloseForm();
        },
    });

    const updateMutation = useMutation(updateProjectLog, {
        onSuccess: () => {
            queryClient.invalidateQueries(['projectLogs', projectId]);
            handleCloseForm();
        },
    });

    const deleteMutation = useMutation(deleteProjectLog, {
        onSuccess: () => {
            queryClient.invalidateQueries(['projectLogs', projectId]);
        },
    });

    const handleOpenForm = (log?: any) => {
        if (log) {
            setSelectedLog(log);
            setFormData({
                title: log.title,
                content: log.content,
                log_type: log.log_type,
            });
        } else {
            setSelectedLog(null);
            setFormData({
                title: '',
                content: '',
                log_type: 'progress',
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedLog(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLog) {
            updateMutation.mutate({
                projectId,
                logId: selectedLog.id,
                ...formData,
            });
        } else {
            createMutation.mutate({
                projectId,
                ...formData,
            });
        }
    };

    const handleDelete = (logId: number) => {
        if (window.confirm('Are you sure you want to delete this log entry?')) {
            deleteMutation.mutate({ projectId, logId });
        }
    };

    const getLogTypeColor = (type: string) => {
        switch (type) {
            case 'progress':
                return 'success.main';
            case 'issue':
                return 'error.main';
            case 'decision':
                return 'info.main';
            default:
                return 'text.primary';
        }
    };

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Project Logs</Typography>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    size="small"
                >
                    Add Log Entry
                </Button>
            </Box>

            <List>
                {logs.map((log: any) => (
                    <Paper key={log.id} sx={{ mb: 2 }}>
                        <ListItem
                            secondaryAction={
                                <Box>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleOpenForm(log)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleDelete(log.id)}
                                        size="small"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="subtitle1">{log.title}</Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: getLogTypeColor(log.log_type) }}
                                        >
                                            {log.log_type}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 1 }}
                                        >
                                            {log.content}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 1, display: 'block' }}
                                        >
                                            {format(new Date(log.created_at), 'PPp')}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    </Paper>
                ))}
            </List>

            <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {selectedLog ? 'Edit Log Entry' : 'New Log Entry'}
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
                                label="Content"
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                multiline
                                rows={4}
                                fullWidth
                                required
                            />
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.log_type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            log_type: e.target.value,
                                        })
                                    }
                                    label="Type"
                                >
                                    <MenuItem value="progress">Progress</MenuItem>
                                    <MenuItem value="issue">Issue</MenuItem>
                                    <MenuItem value="decision">Decision</MenuItem>
                                    <MenuItem value="note">Note</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseForm}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {selectedLog ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};
