import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Popover,
    Stack,
    Grid,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ColorLens as ColorLensIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import ConnectionIcon from './ConnectionIcon'; // You need to create this icon component
import { useMindMap } from '../../context/MindMapContext';

interface MindmapToolbarProps {
    onSave?: () => void;
}

const COLORS = [
    '#f44336', // Red
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#673ab7', // Deep Purple
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#03a9f4', // Light Blue
    '#00bcd4', // Cyan
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffeb3b', // Yellow
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
];

export const MindmapToolbar: React.FC<MindmapToolbarProps> = ({ onSave }) => {
    const {
        nodes,
        selectedNodes,
        setNodes,
        setConnections,
        connections,
        updateNode,
        deleteSelectedNodes,
    } = useMindMap();

    const [isAddNodeDialogOpen, setAddNodeDialogOpen] = useState(false);
    const [newNodeText, setNewNodeText] = useState('');
    const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
    const [editNodeDialogOpen, setEditNodeDialogOpen] = useState(false);
    const [editNodeText, setEditNodeText] = useState('');
    const [isAddConnectionMode, setAddConnectionMode] = useState(false);
    const [connectionStartNode, setConnectionStartNode] = useState<string | null>(null);

    useEffect(() => {
        if (selectedNodes.length === 0) {
            setEditNodeDialogOpen(false);
            setAddConnectionMode(false);
            setConnectionStartNode(null);
        }
    }, [selectedNodes]);

    const handleAddNode = () => {
        if (!newNodeText.trim()) return;

        const centerX = nodes.reduce((sum, node) => sum + node.x, 0) / (nodes.length || 1);
        const centerY = nodes.reduce((sum, node) => sum + node.y, 0) / (nodes.length || 1);
        const offset = 150;

        const newNode = {
            id: Math.random().toString(36).substr(2, 9),
            text: newNodeText,
            x: centerX + offset,
            y: centerY + offset,
            style: { width: 120, height: 40 },
        };

        setNodes(prev => [...prev, newNode]);

        if (connectionStartNode) {
            setConnections(prev => [...prev, {
                source: connectionStartNode,
                target: newNode.id,
                points: [
                    { x: nodes.find(n => n.id === connectionStartNode)?.x || 0, 
                      y: nodes.find(n => n.id === connectionStartNode)?.y || 0 },
                    { x: newNode.x, y: newNode.y }
                ]
            }]);
            setConnectionStartNode(null);
            setAddConnectionMode(false);
        }

        setNewNodeText('');
        setAddNodeDialogOpen(false);
    };

    const handleEditNode = () => {
        if (!editNodeText.trim() || selectedNodes.length !== 1) return;
        updateNode(selectedNodes[0], { text: editNodeText });
        setEditNodeText('');
        setEditNodeDialogOpen(false);
    };

    const handleColorSelect = (color: string) => {
        if (selectedNodes.length === 0) return;
        setNodes(prev => prev.map(node => 
            selectedNodes.includes(node.id)
                ? { 
                    ...node, 
                    style: { 
                        ...(node.style || {}), 
                        backgroundColor: color 
                    } 
                }
                : node
        ));
        setColorPickerAnchor(null);
    };

    const handleAddConnection = () => {
        if (!isAddConnectionMode) {
            if (selectedNodes.length === 1) {
                setConnectionStartNode(selectedNodes[0]);
                setAddConnectionMode(true);
            }
        } else {
            if (selectedNodes.length === 1 && connectionStartNode && connectionStartNode !== selectedNodes[0]) {
                const startNode = nodes.find(n => n.id === connectionStartNode);
                const endNode = nodes.find(n => n.id === selectedNodes[0]);

                if (startNode && endNode) {
                    const connectionExists = connections.some(
                        conn => conn.source === connectionStartNode && conn.target === selectedNodes[0]
                    );

                    if (!connectionExists) {
                        setConnections(prev => [...prev, {
                            source: connectionStartNode,
                            target: selectedNodes[0],
                            points: [
                                { x: startNode.x, y: startNode.y },
                                { x: endNode.x, y: endNode.y }
                            ]
                        }]);
                    }
                }
            }
            setConnectionStartNode(null);
            setAddConnectionMode(false);
        }
    };

    const handleDeleteConnection = () => {
        if (selectedNodes.length !== 2) return;

        setConnections(prev => prev.filter(conn => 
            !(conn.source === selectedNodes[0] && conn.target === selectedNodes[1]) &&
            !(conn.source === selectedNodes[1] && conn.target === selectedNodes[0])
        ));
    };

    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', p: 1, backgroundColor: '#f5f5f5' }}>
            <Tooltip title="Add Node">
                <IconButton onClick={() => setAddNodeDialogOpen(true)}>
                    <AddIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title={isAddConnectionMode ? "Select Target Node" : "Add Connection"}>
                <span>
                    <IconButton
                        onClick={handleAddConnection}
                        color={isAddConnectionMode ? "secondary" : "default"}
                        disabled={(!isAddConnectionMode && selectedNodes.length !== 1) || 
                                (isAddConnectionMode && selectedNodes.length !== 1)}
                    >
                        <ConnectionIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="Delete Connection">
                <span>
                    <IconButton
                        onClick={handleDeleteConnection}
                        disabled={selectedNodes.length !== 2}
                    >
                        <DeleteIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="Edit Node">
                <span>
                    <IconButton
                        onClick={() => {
                            if (selectedNodes.length === 1) {
                                const node = nodes.find(n => n.id === selectedNodes[0]);
                                if (node) {
                                    setEditNodeText(node.text);
                                    setEditNodeDialogOpen(true);
                                }
                            }
                        }}
                        disabled={selectedNodes.length !== 1}
                    >
                        <EditIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="Change Color">
                <span>
                    <IconButton
                        onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                        disabled={selectedNodes.length === 0}
                    >
                        <ColorLensIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="Delete Node">
                <span>
                    <IconButton
                        onClick={deleteSelectedNodes}
                        disabled={selectedNodes.length === 0}
                    >
                        <DeleteIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="Save">
                <span>
                    <IconButton 
                        onClick={onSave}
                        disabled={!onSave}
                    >
                        <SaveIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Dialog open={isAddNodeDialogOpen} onClose={() => setAddNodeDialogOpen(false)}>
                <DialogTitle>Add New Node</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Node Text"
                        fullWidth
                        value={newNodeText}
                        onChange={(e) => setNewNodeText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddNodeDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddNode}>Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editNodeDialogOpen} onClose={() => setEditNodeDialogOpen(false)}>
                <DialogTitle>Edit Node</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Node Text"
                        fullWidth
                        value={editNodeText}
                        onChange={(e) => setEditNodeText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditNodeDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditNode}>Save</Button>
                </DialogActions>
            </Dialog>

            <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={() => setColorPickerAnchor(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                        {COLORS.map((color) => (
                            <Grid item key={color}>
                                <IconButton
                                    onClick={() => handleColorSelect(color)}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: color,
                                        border: '1px solid #ccc',
                                        '&:hover': {
                                            backgroundColor: color,
                                            opacity: 0.8,
                                        },
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Popover>
        </Box>
    );
};
