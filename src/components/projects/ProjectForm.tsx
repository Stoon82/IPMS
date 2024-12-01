import React from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import { useFormik } from 'formik';
import { Project, ProjectStatus, ProjectPriority, ProjectCreate, ProjectUpdate } from '../../types/project';

interface ProjectFormData {
    title: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    target_end_date?: Date | string;
}

interface ProjectFormProps {
    initialData?: Project;
    onSubmit: (data: ProjectCreate | ProjectUpdate) => void;
    onCancel: () => void;
    open: boolean;
    isSubmitting: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    open,
    isSubmitting,
}) => {
    const formik = useFormik<ProjectFormData>({
        initialValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            status: initialData?.status || ProjectStatus.ACTIVE,
            priority: initialData?.priority || ProjectPriority.MEDIUM,
            target_end_date: initialData?.target_end_date || '',
        },
        onSubmit: (formData) => {
            if (initialData) {
                onSubmit({
                    id: initialData.id,
                    ...formData,
                    target_end_date: formData.target_end_date ? new Date(formData.target_end_date) : undefined,
                });
            } else {
                onSubmit({
                    ...formData,
                    target_end_date: formData.target_end_date ? new Date(formData.target_end_date) : undefined,
                } as ProjectCreate);
            }
        },
    });

    const handleStatusChange = (event: SelectChangeEvent<ProjectStatus>) => {
        formik.setFieldValue('status', event.target.value);
    };

    const handlePriorityChange = (event: SelectChangeEvent<ProjectPriority>) => {
        formik.setFieldValue('priority', event.target.value);
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    fullWidth
                    id="title"
                    name="title"
                    label="Title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                />

                <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                />

                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select<ProjectStatus>
                        value={formik.values.status}
                        label="Status"
                        onChange={handleStatusChange}
                    >
                        {Object.values(ProjectStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select<ProjectPriority>
                        value={formik.values.priority}
                        label="Priority"
                        onChange={handlePriorityChange}
                    >
                        {Object.values(ProjectPriority).map((priority) => (
                            <MenuItem key={priority} value={priority}>
                                {priority}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    id="target_end_date"
                    name="target_end_date"
                    label="Target End Date"
                    type="date"
                    value={formik.values.target_end_date || ''}
                    onChange={formik.handleChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || !formik.isValid}
                    >
                        {isSubmitting ? 'Submitting...' : initialData ? 'Update' : 'Create'}
                    </Button>
                </Box>
            </Box>
        </form>
    );
};
