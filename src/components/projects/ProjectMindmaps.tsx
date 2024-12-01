import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Grid,
    Typography,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MindmapView } from '../mindmap/MindmapView';
import { MindMapProvider } from '../../context/MindMapContext';
import {
    getProjectMindmaps,
    createMindmap,
    updateMindmap,
    deleteMindmap,
} from '../../services/mindmaps';
import { Mindmap, MindmapNode } from '../../types/mindmap';

interface ProjectMindmapsProps {
    projectId: number;
}

export const ProjectMindmaps: React.FC<ProjectMindmapsProps> = ({ projectId }) => {
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newMindmapTitle, setNewMindmapTitle] = useState('');
    const [selectedMindmap, setSelectedMindmap] = useState<Mindmap | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const { data: mindmaps = [], isLoading } = useQuery<Mindmap[]>({
        queryKey: ['project-mindmaps', projectId],
        queryFn: () => getProjectMindmaps(projectId),
    });

    const createMutation = useMutation({
        mutationFn: (title: string) =>
            createMindmap(title, { id: 'root', text: title, children: [] }, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-mindmaps', projectId] });
            setIsCreateDialogOpen(false);
            setNewMindmapTitle('');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; title: string; mindmapData: MindmapNode }) =>
            updateMindmap(data.id, data.title, data.mindmapData),
    });

    const deleteMindmapMutation = useMutation({
        mutationFn: (mindmapId: number) => deleteMindmap(mindmapId),
        onSuccess: (_, mindmapId) => {
            queryClient.invalidateQueries({ queryKey: ['project-mindmaps', projectId] });
            if (selectedMindmap?.id === mindmapId) {
                setSelectedMindmap(null);
            }
        },
    });

    const handleCreateMindmap = () => {
        if (newMindmapTitle.trim()) {
            createMutation.mutate(newMindmapTitle.trim());
        }
    };

    const handleUpdateMindmap = (mindmapId: number, mindmapData: MindmapNode) => {
        if (selectedMindmap) {
            console.log('Starting mindmap update...', {
                mindmapId,
                selectedMindmap,
                mindmapData
            });
            
            // Verify data structure before update
            if (!mindmapData.id || !mindmapData.text) {
                console.error('Invalid mindmap data structure:', mindmapData);
                return;
            }

            updateMutation.mutate({
                id: mindmapId,
                title: selectedMindmap.title,
                mindmapData,
            }, {
                onSuccess: () => {
                    console.log('Mindmap update successful');
                    queryClient.invalidateQueries({ queryKey: ['project-mindmaps', projectId] });
                    setIsEditMode(false);
                },
                onError: (error) => {
                    console.error('Mindmap update failed:', error);
                }
            });
        } else {
            console.error('No mindmap selected for update');
        }
    };

    const handleDeleteMindmap = (mindmapId: number) => {
        deleteMindmapMutation.mutate(mindmapId);
    };

    if (isLoading) {
        return <Typography>Loading mind maps...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Mind Maps</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    Create New Mind Map
                </Button>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <List>
                        {mindmaps.map((mindmap) => (
                            <ListItem
                                key={mindmap.id}
                                button
                                onClick={() => setSelectedMindmap(mindmap)}
                                selected={selectedMindmap?.id === mindmap.id}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMindmap(mindmap.id);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText primary={mindmap.title} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={9}>
                    {selectedMindmap ? (
                        <Box>
                            <Button
                                variant="outlined"
                                onClick={() => setSelectedMindmap(null)}
                                sx={{ mb: 2 }}
                            >
                                Back to List
                            </Button>
                            <MindMapProvider>
                                <MindmapView
                                    data={selectedMindmap.data}
                                    onSave={(updatedData) => handleUpdateMindmap(selectedMindmap.id, updatedData)}
                                    width={800}
                                    height={600}
                                />
                            </MindMapProvider>
                        </Box>
                    ) : (
                        <Typography variant="h6" gutterBottom>
                            Select a mind map to view
                        </Typography>
                    )}
                </Grid>
            </Grid>

            <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
                <DialogTitle>Create New Mind Map</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={newMindmapTitle}
                        onChange={(e) => setNewMindmapTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateMindmap} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
