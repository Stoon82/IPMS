import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getIdeas, createIdea, updateIdea, deleteIdea, getTags } from '../services/ideas';
import { Idea, IdeaCreate, IdeaUpdate } from '../types/idea';

type IdeaStatus = 'draft' | 'in_progress' | 'implemented' | 'archived';

interface IdeaFormData {
    title: string;
    description: string;
    status: IdeaStatus;
    tags: string[];
}

export const Ideas: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [formData, setFormData] = useState<IdeaFormData>({
        title: '',
        description: '',
        status: 'draft',
        tags: [],
    });

    const queryClient = useQueryClient();
    const { data: ideas = [], isLoading } = useQuery('ideas', getIdeas, {
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    });
    const { data: tags = [] } = useQuery('tags', getTags);

    const createMutation = useMutation(createIdea, {
        onSuccess: () => {
            queryClient.invalidateQueries('ideas');
            handleCloseForm();
        },
    });

    const updateMutation = useMutation(updateIdea, {
        onSuccess: () => {
            queryClient.invalidateQueries('ideas');
            handleCloseForm();
        },
    });

    const deleteMutation = useMutation(deleteIdea, {
        onSuccess: () => {
            queryClient.invalidateQueries('ideas');
        },
    });

    const handleOpenForm = (idea?: Idea) => {
        if (idea) {
            setSelectedIdea(idea);
            setFormData({
                title: idea.title,
                description: idea.description,
                status: idea.status as IdeaStatus,
                tags: idea.tags.map(tag => tag.name),
            });
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'draft',
                tags: [],
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedIdea(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIdea) {
            const updateData: IdeaUpdate & { id: number } = {
                id: selectedIdea.id,
                title: formData.title,
                description: formData.description,
                status: formData.status,
                tags: formData.tags,
            };
            updateMutation.mutate(updateData);
        } else {
            const createData: IdeaCreate = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                tags: formData.tags,
            };
            createMutation.mutate(createData);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this idea?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Ideas</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                >
                    New Idea
                </Button>
            </Box>

            <Grid container spacing={3}>
                {ideas.map((idea) => (
                    <Grid item xs={12} sm={6} md={4} key={idea.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {idea.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {idea.description}
                                </Typography>
                                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                    {idea.tags.map((tag) => (
                                        <Chip
                                            key={tag.id}
                                            label={tag.name}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                                <Chip
                                    label={idea.status}
                                    size="small"
                                    color={
                                        idea.status === 'implemented'
                                            ? 'success'
                                            : idea.status === 'in_progress'
                                            ? 'warning'
                                            : 'default'
                                    }
                                />
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleOpenForm(idea)}>
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(idea.id)}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {selectedIdea ? 'Edit Idea' : 'New Idea'}
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
                                required
                            />
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value as IdeaStatus,
                                        })
                                    }
                                    label="Status"
                                >
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="implemented">Implemented</MenuItem>
                                    <MenuItem value="archived">Archived</MenuItem>
                                </Select>
                            </FormControl>
                            <Autocomplete
                                multiple
                                options={tags.map((tag) => tag.name)}
                                value={formData.tags}
                                onChange={(_, newValue) =>
                                    setFormData({ ...formData, tags: newValue })
                                }
                                freeSolo
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tags"
                                        placeholder="Add tags"
                                    />
                                )}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseForm}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedIdea ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};
