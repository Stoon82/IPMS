import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    Chip,
    TextField,
    Autocomplete,
} from '@mui/material';
import {
    Add as AddIcon,
    Link as LinkIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProjectIdeas,
    linkIdeaToProject,
    unlinkIdeaFromProject,
    getAvailableIdeas,
} from '../../services/projectIdeas';
import { Idea } from '../../types/idea';
import { format } from 'date-fns';

interface ProjectIdeasProps {
    projectId: number;
}

export const ProjectIdeas: React.FC<ProjectIdeasProps> = ({ projectId }) => {
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const queryClient = useQueryClient();
    
    const { data: linkedIdeas = [], isLoading: isLoadingLinked } = useQuery<Idea[]>({
        queryKey: ['projectIdeas', projectId],
        queryFn: () => getProjectIdeas(projectId)
    });

    const { data: availableIdeas = [], isLoading: isLoadingAvailable } = useQuery<Idea[]>({
        queryKey: ['availableIdeas', projectId],
        queryFn: () => getAvailableIdeas(projectId),
        enabled: isLinkDialogOpen
    });

    const linkMutation = useMutation({
        mutationFn: (ideaId: number) => linkIdeaToProject(projectId, ideaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectIdeas', projectId] });
            queryClient.invalidateQueries({ queryKey: ['availableIdeas', projectId] });
            handleCloseLinkDialog();
        },
    });

    const unlinkMutation = useMutation({
        mutationFn: (ideaId: number) => unlinkIdeaFromProject(projectId, ideaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectIdeas', projectId] });
            queryClient.invalidateQueries({ queryKey: ['availableIdeas', projectId] });
        },
    });

    const handleOpenLinkDialog = () => {
        setIsLinkDialogOpen(true);
    };

    const handleCloseLinkDialog = () => {
        setIsLinkDialogOpen(false);
        setSelectedIdea(null);
    };

    const handleLinkIdea = () => {
        if (selectedIdea) {
            linkMutation.mutate(selectedIdea.id);
        }
    };

    const handleUnlinkIdea = (idea: Idea) => {
        if (window.confirm('Are you sure you want to unlink this idea from the project?')) {
            unlinkMutation.mutate(idea.id);
        }
    };

    const filteredLinkedIdeas = linkedIdeas.filter((idea) =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoadingLinked) {
        return <Typography>Loading project ideas...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    size="small"
                    placeholder="Search ideas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, mr: 2 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenLinkDialog}
                >
                    Link Idea
                </Button>
            </Box>

            <List>
                {filteredLinkedIdeas.map((idea) => (
                    <ListItem
                        key={idea.id}
                        sx={{
                            mb: 1,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                        }}
                    >
                        <ListItemText
                            primary={idea.title}
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {idea.description}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <Chip
                                            label={idea.status}
                                            size="small"
                                            color={idea.status === 'in_progress' ? 'success' : 'default'}
                                        />
                                        {idea.created_at && (
                                            <Chip
                                                label={`Created: ${format(new Date(idea.created_at), 'MMM d, yyyy')}`}
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
                                aria-label="unlink"
                                onClick={() => handleUnlinkIdea(idea)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
                {filteredLinkedIdeas.length === 0 && (
                    <Typography color="text.secondary" align="center" py={4}>
                        {searchQuery
                            ? 'No ideas found matching your search.'
                            : 'No ideas linked to this project yet. Link some ideas to get started!'}
                    </Typography>
                )}
            </List>

            <Dialog open={isLinkDialogOpen} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Link Idea to Project</DialogTitle>
                <DialogContent>
                    <Box pt={1}>
                        <Autocomplete
                            value={selectedIdea}
                            onChange={(_, newValue) => setSelectedIdea(newValue)}
                            options={availableIdeas}
                            getOptionLabel={(option) => option.title}
                            loading={isLoadingAvailable}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select an idea"
                                    placeholder="Search available ideas..."
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box>
                                        <Typography variant="subtitle1">{option.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {option.description}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLinkDialog}>Cancel</Button>
                    <Button
                        onClick={handleLinkIdea}
                        variant="contained"
                        color="primary"
                        disabled={!selectedIdea}
                        startIcon={<LinkIcon />}
                    >
                        Link Idea
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
