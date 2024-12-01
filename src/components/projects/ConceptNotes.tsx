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
    TextField,
    Card,
    CardContent,
    CardActions,
    Chip,
    Stack,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Sort as SortIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ConceptNote,
    ConceptNoteCreate,
    ConceptNoteUpdate,
    getProjectConceptNotes,
    createConceptNote,
    updateConceptNote,
    deleteConceptNote,
} from '../../services/concepts';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface ConceptNotesProps {
    projectId: number;
}

interface ConceptNoteFormData {
    title: string;
    content: string;
}

type SortField = 'title' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    order: SortOrder;
}

const initialFormData: ConceptNoteFormData = {
    title: '',
    content: '',
};

export const ConceptNotes: React.FC<ConceptNotesProps> = ({ projectId }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<ConceptNote | null>(null);
    const [formData, setFormData] = useState<ConceptNoteFormData>(initialFormData);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'created_at',
        order: 'desc',
    });
    const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

    const queryClient = useQueryClient();

    const { data: notes = [], isLoading } = useQuery<ConceptNote[]>({
        queryKey: ['conceptNotes', projectId],
        queryFn: () => getProjectConceptNotes(projectId)
    });

    const createMutation = useMutation({
        mutationFn: (noteData: ConceptNoteCreate) => createConceptNote(noteData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conceptNotes', projectId] });
            handleCloseForm();
            setSelectedNote(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }: ConceptNoteUpdate) => updateConceptNote({ id, ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conceptNotes', projectId] });
            handleCloseForm();
            setSelectedNote(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteConceptNote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conceptNotes', projectId] });
            setSelectedNote(null);
        }
    });

    const handleOpenForm = (note?: ConceptNote) => {
        if (note) {
            setSelectedNote(note);
            setFormData({
                title: note.title,
                content: note.content,
            });
        } else {
            setSelectedNote(null);
            setFormData(initialFormData);
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedNote(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const noteData = {
            ...formData,
            project_id: projectId,
        };

        if (selectedNote) {
            updateMutation.mutate({ id: selectedNote.id, ...formData });
        } else {
            createMutation.mutate(noteData);
        }
    };

    const handleDelete = (note: ConceptNote) => {
        if (window.confirm('Are you sure you want to delete this concept note?')) {
            deleteMutation.mutate(note.id);
        }
    };

    const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setSortMenuAnchor(event.currentTarget);
    };

    const handleSortMenuClose = () => {
        setSortMenuAnchor(null);
    };

    const handleSort = (field: SortField) => {
        setSortConfig((prev) => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
        }));
        handleSortMenuClose();
    };

    const filteredAndSortedNotes = notes
        .filter(
            (note) =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const { field, order } = sortConfig;
            const multiplier = order === 'asc' ? 1 : -1;
            
            if (field === 'title') {
                return multiplier * a.title.localeCompare(b.title);
            }
            
            const dateA = new Date(a[field]).getTime();
            const dateB = new Date(b[field]).getTime();
            return multiplier * (dateA - dateB);
        });

    if (isLoading) {
        return <Typography>Loading concept notes...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    size="small"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, mr: 2 }}
                />
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        startIcon={<SortIcon />}
                        onClick={handleSortMenuOpen}
                    >
                        Sort
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenForm()}
                    >
                        New Note
                    </Button>
                </Stack>
            </Box>

            <Menu
                anchorEl={sortMenuAnchor}
                open={Boolean(sortMenuAnchor)}
                onClose={handleSortMenuClose}
            >
                <MenuItem onClick={() => handleSort('title')}>
                    Title {sortConfig.field === 'title' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                </MenuItem>
                <MenuItem onClick={() => handleSort('created_at')}>
                    Created {sortConfig.field === 'created_at' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                </MenuItem>
                <MenuItem onClick={() => handleSort('updated_at')}>
                    Updated {sortConfig.field === 'updated_at' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                </MenuItem>
            </Menu>

            <Stack spacing={2}>
                {filteredAndSortedNotes.map((note) => (
                    <Card key={note.id}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Typography variant="h6" gutterBottom>
                                    {note.title}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenForm(note)}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                            <Box mb={2}>
                                <ReactMarkdown>{note.content}</ReactMarkdown>
                            </Box>
                            <Box display="flex" gap={1}>
                                <Chip
                                    label={`Created: ${format(new Date(note.created_at), 'MMM d, yyyy')}`}
                                    size="small"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Updated: ${format(new Date(note.updated_at), 'MMM d, yyyy')}`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDelete(note)}
                            >
                                Delete
                            </Button>
                        </CardActions>
                    </Card>
                ))}
                {filteredAndSortedNotes.length === 0 && (
                    <Typography color="text.secondary" align="center" py={4}>
                        {searchQuery
                            ? 'No concept notes found matching your search.'
                            : 'No concept notes yet. Create one to get started!'}
                    </Typography>
                )}
            </Stack>

            <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {selectedNote ? 'Edit Concept Note' : 'New Concept Note'}
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
                                rows={8}
                                fullWidth
                                required
                                placeholder="Supports Markdown formatting"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseForm}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedNote ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};
