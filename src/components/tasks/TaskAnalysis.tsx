import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Analytics as AnalyticsIcon,
    Schedule as TimeIcon,
    Label as TagIcon,
    Warning as ChallengeIcon,
    Lightbulb as SuggestionIcon,
} from '@mui/icons-material';

interface TaskAnalysisProps {
    open: boolean;
    onClose: () => void;
    analysis: any;
    isLoading: boolean;
    error: Error | null;
}

export const TaskAnalysis: React.FC<TaskAnalysisProps> = ({
    open,
    onClose,
    analysis,
    isLoading,
    error,
}) => {
    if (!open) return null;

    if (error) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <Alert severity="error">
                        Failed to load analysis: {error.message}
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <AnalyticsIcon sx={{ mr: 1 }} />
                    AI Task Analysis
                </Box>
            </DialogTitle>

            <DialogContent>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : analysis ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Overview
                        </Typography>
                        <List>
                            {analysis.tags && (
                                <ListItem>
                                    <ListItemIcon>
                                        <TagIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Tags"
                                        secondary={
                                            <Box mt={1}>
                                                {analysis.tags.map((tag: string) => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        size="small"
                                                        sx={{ mr: 1, mb: 1 }}
                                                    />
                                                ))}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            )}
                            
                            {analysis.estimated_hours && (
                                <ListItem>
                                    <ListItemIcon>
                                        <TimeIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Time Estimate"
                                        secondary={`${analysis.estimated_hours} hours`}
                                    />
                                </ListItem>
                            )}
                        </List>

                        {analysis.potential_challenges && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Potential Challenges
                                </Typography>
                                <List>
                                    {analysis.potential_challenges.map((challenge: string, index: number) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                <ChallengeIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={challenge} />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}

                        {analysis.complexity_analysis && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Complexity Analysis
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemText primary={analysis.complexity_analysis} />
                                    </ListItem>
                                </List>
                            </>
                        )}
                    </Box>
                ) : (
                    <Alert severity="info">No analysis available</Alert>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
