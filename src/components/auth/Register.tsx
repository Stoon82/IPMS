import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const validationSchema = yup.object({
    username: yup.string()
        .min(3, 'Username must be at least 3 characters')
        .required('Username is required'),
    email: yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    full_name: yup.string()
        .min(2, 'Full name must be at least 2 characters'),
});

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            full_name: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const { confirmPassword, ...registerData } = values;
                await register(registerData);
                navigate('/dashboard');
            } catch (error: any) {
                setErrors({
                    email: 'Username or email already exists',
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Create Account
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="username"
                            name="username"
                            label="Username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            id="full_name"
                            name="full_name"
                            label="Full Name"
                            value={formik.values.full_name}
                            onChange={formik.handleChange}
                            error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                            helperText={formik.touched.full_name && formik.errors.full_name}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={formik.isSubmitting}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                        >
                            Already have an account? Sign In
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export { Register };
