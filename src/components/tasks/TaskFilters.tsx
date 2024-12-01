import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    IconButton,
    Tooltip,
    Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

export interface TaskFilters {
    status?: string;
    priority?: string;
    dueDateFrom?: Date | null;
    dueDateTo?: Date | null;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface TaskFiltersProps {
    filters: TaskFilters;
    onFiltersChange: (filters: TaskFilters) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
    filters,
    onFiltersChange,
}) => {
    const handleChange = (field: keyof TaskFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [field]: value,
        });
    };

    const handleClearFilters = () => {
        onFiltersChange({
            status: undefined,
            priority: undefined,
            dueDateFrom: null,
            dueDateTo: null,
            search: '',
            sortBy: undefined,
            sortOrder: 'asc',
        });
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <FilterIcon sx={{ mr: 1 }} />
                <Box flexGrow={1}>Filters</Box>
                <Tooltip title="Clear filters">
                    <IconButton onClick={handleClearFilters} size="small">
                        <ClearIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        label="Search"
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                        size="small"
                    />
                </Grid>

                <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status || ''}
                            onChange={(e) => handleChange('status', e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={filters.priority || ''}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            label="Priority"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                    <DatePicker
                        label="Due From"
                        value={filters.dueDateFrom}
                        onChange={(date) => handleChange('dueDateFrom', date)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                </Grid>

                <Grid item xs={12} md={2}>
                    <DatePicker
                        label="Due To"
                        value={filters.dueDateTo}
                        onChange={(date) => handleChange('dueDateTo', date)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={filters.sortBy || ''}
                            onChange={(e) => handleChange('sortBy', e.target.value)}
                            label="Sort By"
                        >
                            <MenuItem value="">Default</MenuItem>
                            <MenuItem value="due_date">Due Date</MenuItem>
                            <MenuItem value="priority">Priority</MenuItem>
                            <MenuItem value="status">Status</MenuItem>
                            <MenuItem value="created_at">Created Date</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort Order</InputLabel>
                        <Select
                            value={filters.sortOrder || 'asc'}
                            onChange={(e) =>
                                handleChange('sortOrder', e.target.value)
                            }
                            label="Sort Order"
                        >
                            <MenuItem value="asc">Ascending</MenuItem>
                            <MenuItem value="desc">Descending</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
};
