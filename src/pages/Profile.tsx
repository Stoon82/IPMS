import React from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useProfile } from '../hooks/useProfile';

const validationSchema = yup.object({
    full_name: yup.string().nullable(),
    bio: yup.string().nullable(),
    theme_preference: yup.string().required('Theme preference is required'),
    notification_preferences: yup.string().required('Notification preference is required'),
    timezone: yup.string().required('Timezone is required'),
});

// Use a static list of common timezones instead of Intl.supportedValuesOf
const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
];

export const Profile: React.FC = () => {
    const { profile, isLoading, error, updateProfile, isUpdating, updateError } = useProfile();
    const [showSuccess, setShowSuccess] = React.useState(false);

    const formik = useFormik({
        initialValues: {
            full_name: profile?.full_name ?? '',
            bio: profile?.bio ?? '',
            theme_preference: profile?.theme_preference ?? 'light',
            notification_preferences: profile?.notification_preferences ?? 'all',
            timezone: profile?.timezone ?? 'UTC',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateProfile(values);
            setShowSuccess(true);
        },
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">Error loading profile. Please try again later.</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Profile Settings
            </Typography>

            <Paper sx={{ p: 3, mt: 3 }}>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="full_name"
                                name="full_name"
                                label="Full Name"
                                value={formik.values.full_name}
                                onChange={formik.handleChange}
                                error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                                helperText={formik.touched.full_name && formik.errors.full_name}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="bio"
                                name="bio"
                                label="Bio"
                                multiline
                                rows={4}
                                value={formik.values.bio}
                                onChange={formik.handleChange}
                                error={formik.touched.bio && Boolean(formik.errors.bio)}
                                helperText={formik.touched.bio && formik.errors.bio}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="theme-preference-label">Theme</InputLabel>
                                <Select
                                    labelId="theme-preference-label"
                                    id="theme_preference"
                                    name="theme_preference"
                                    value={formik.values.theme_preference}
                                    onChange={formik.handleChange}
                                    label="Theme"
                                >
                                    <MenuItem value="light">Light</MenuItem>
                                    <MenuItem value="dark">Dark</MenuItem>
                                    <MenuItem value="system">System</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="notification-preferences-label">
                                    Notifications
                                </InputLabel>
                                <Select
                                    labelId="notification-preferences-label"
                                    id="notification_preferences"
                                    name="notification_preferences"
                                    value={formik.values.notification_preferences}
                                    onChange={formik.handleChange}
                                    label="Notifications"
                                >
                                    <MenuItem value="all">All Notifications</MenuItem>
                                    <MenuItem value="important">Important Only</MenuItem>
                                    <MenuItem value="none">None</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="timezone-label">Timezone</InputLabel>
                                <Select
                                    labelId="timezone-label"
                                    id="timezone"
                                    name="timezone"
                                    value={formik.values.timezone}
                                    onChange={formik.handleChange}
                                    label="Timezone"
                                >
                                    {timezones.map((timezone) => (
                                        <MenuItem key={timezone} value={timezone}>
                                            {timezone}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isUpdating}
                                sx={{ mt: 2 }}
                            >
                                {isUpdating ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={() => setShowSuccess(false)}
            >
                <Alert severity="success" onClose={() => setShowSuccess(false)}>
                    Profile updated successfully!
                </Alert>
            </Snackbar>

            {updateError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Error updating profile. Please try again.
                </Alert>
            )}
        </Box>
    );
};
