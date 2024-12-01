import React, { useState } from 'react';
import {
    Box,
    Typography,
    Autocomplete,
    TextField,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSummary, UserRole } from '../../types/user';
import { searchUsers, getProjectMembers } from '../../services/users';
import { addTeamMember, removeTeamMember } from '../../services/projects';

const ROLE_COLORS: Record<UserRole, 'default' | 'primary' | 'secondary'> = {
    admin: 'secondary',
    manager: 'primary',
    member: 'default',
};

interface TeamManagementProps {
    projectId: number;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ projectId }) => {
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

    const queryClient = useQueryClient();

    const { data: members = [] } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => getProjectMembers(projectId)
    });

    const { data: searchResults = [] } = useQuery({
        queryKey: ['user-search', searchQuery],
        queryFn: () => searchUsers(searchQuery),
        enabled: isAddMemberOpen && searchQuery.length > 0
    });

    const addMemberMutation = useMutation({
        mutationFn: (userId: number) => addTeamMember(projectId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
            setIsAddMemberOpen(false);
            setSelectedUser(null);
        }
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => removeTeamMember(projectId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
        }
    });

    const handleAddMember = () => {
        if (selectedUser) {
            addMemberMutation.mutate(selectedUser.id);
        }
    };

    const handleRemoveMember = (userId: number) => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            removeMemberMutation.mutate(userId);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Team Members</Typography>
                <Button
                    startIcon={<PersonAddIcon />}
                    onClick={() => setIsAddMemberOpen(true)}
                    variant="outlined"
                >
                    Add Member
                </Button>
            </Box>

            <List>
                {members.map((member) => (
                    <ListItem key={member.id} divider>
                        <ListItemAvatar>
                            <Avatar src={member.avatar_url}>
                                {member.full_name.charAt(0)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={member.full_name}
                            secondary={
                                <Box display="flex" gap={1} alignItems="center">
                                    <Typography variant="body2" component="span">
                                        @{member.username}
                                    </Typography>
                                    <Chip
                                        label={member.role}
                                        size="small"
                                        color={ROLE_COLORS[member.role]}
                                    />
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                onClick={() => handleRemoveMember(member.id)}
                                size="small"
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)}>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={searchResults}
                        getOptionLabel={(option) => `${option.full_name} (@${option.username})`}
                        value={selectedUser}
                        onChange={(_, newValue) => setSelectedUser(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search Users"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar src={option.avatar_url} sx={{ width: 24, height: 24 }}>
                                        {option.full_name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body1">{option.full_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            @{option.username}
                                        </Typography>
                                    </Box>
                                </Box>
                            </li>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddMember}
                        variant="contained"
                        disabled={!selectedUser}
                    >
                        Add Member
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
