import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Ideas } from './pages/Ideas';
import { PrivateRoute } from './components/auth/PrivateRoute';

// Root layout component that includes providers
const RootLayout = () => {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
};

function App() {
    const router = createBrowserRouter([
        {
            element: <RootLayout />,
            children: [
                {
                    path: "/login",
                    element: <Login />
                },
                {
                    path: "/register",
                    element: <Register />
                },
                {
                    path: "/",
                    element: <PrivateRoute><Dashboard /></PrivateRoute>
                },
                {
                    path: "/tasks",
                    element: <PrivateRoute><Tasks /></PrivateRoute>
                },
                {
                    path: "/projects",
                    element: <PrivateRoute><Projects /></PrivateRoute>
                },
                {
                    path: "/projects/:id",
                    element: <PrivateRoute><ProjectDetail /></PrivateRoute>
                },
                {
                    path: "/ideas",
                    element: <PrivateRoute><Ideas /></PrivateRoute>
                },
                {
                    path: "*",
                    element: <Navigate to="/" replace />
                }
            ]
        }
    ]);

    return <RouterProvider router={router} />;
}

export default App;
