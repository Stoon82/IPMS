import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
} from '@mui/material';
import {
    Task as TaskIcon,
    Folder as ProjectIcon,
    Lightbulb as IdeaIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIdea } from '../../services/ideas';
import { Idea, IdeaCreate } from '../../types/idea';

export const ActionButtons: React.FC = () => {
    const navigate = useNavigate();
    const [isQuickIdeaOpen, setIsQuickIdeaOpen] = useState(false);
    const [ideaTitle, setIdeaTitle] = useState('');
    const [ideaDescription, setIdeaDescription] = useState('');
    const queryClient = useQueryClient();

    const { mutate: createIdeaMutation, isPending } = useMutation({
        mutationFn: (data: IdeaCreate) => createIdea(data),
        onSuccess: (newIdea: Idea) => {
            queryClient.setQueryData(['ideas'], (oldData: Idea[] = []) => [...oldData, newIdea]);
            handleCloseQuickIdea();
        },
    });

    const handleQuickIdea = () => {
        setIsQuickIdeaOpen(true);
    };

    const handleCloseQuickIdea = () => {
        setIsQuickIdeaOpen(false);
        setIdeaTitle('');
        setIdeaDescription('');
    };

    const handleCreateIdea = () => {
        if (ideaTitle.trim()) {
            createIdeaMutation({
                title: ideaTitle,
                description: ideaDescription,
                status: 'draft',
                tags: [],
            });
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Quick Actions
            </Typography>
            <Box display="flex" gap={2}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<TaskIcon />}
                    onClick={() => navigate('/tasks/new')}
                >
                    New Task
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ProjectIcon />}
                    onClick={() => navigate('/projects/new')}
                >
                    New Project
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IdeaIcon />}
                    onClick={handleQuickIdea}
                >
                    Quick Idea
                </Button>
            </Box>

            <Dialog open={isQuickIdeaOpen} onClose={handleCloseQuickIdea} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Quick Idea
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseQuickIdea}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={ideaTitle}
                        onChange={(e) => setIdeaTitle(e.target.value)}
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={ideaDescription}
                        onChange={(e) => setIdeaDescription(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseQuickIdea} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateIdea}
                        color="primary"
                        variant="contained"
                        disabled={!ideaTitle.trim() || isPending}
                    >
                        Save Idea
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
