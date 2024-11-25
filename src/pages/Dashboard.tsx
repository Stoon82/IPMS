import React from 'react';
import { Grid, Box, Typography, CircularProgress, Alert } from '@mui/material';
import {
    Assignment as TaskIcon,
    CheckCircle as CompletedIcon,
    Warning as OverdueIcon,
    Schedule as UpcomingIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useTasks } from '../hooks/useTasks';
import { useTaskStats } from '../hooks/useTaskStats';
import { StatCard } from '../components/dashboard/StatCard';
import { TaskDistributionChart } from '../components/dashboard/TaskDistributionChart';
import { UserProfileCard } from '../components/dashboard/UserProfileCard';

export const Dashboard: React.FC = () => {
    const { tasks, isLoading, error } = useTasks();
    const stats = useTaskStats(tasks || []);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Error loading dashboard data. Please try again later.
            </Alert>
        );
    }

    const statusData = [
        { name: 'To Do', value: stats.tasksByStatus.todo, color: '#1976d2' },
        { name: 'In Progress', value: stats.tasksByStatus.in_progress, color: '#ff9800' },
        { name: 'Done', value: stats.tasksByStatus.done, color: '#4caf50' },
    ];

    const priorityData = [
        { name: 'High', value: stats.tasksByPriority.high, color: '#f44336' },
        { name: 'Medium', value: stats.tasksByPriority.medium, color: '#ff9800' },
        { name: 'Low', value: stats.tasksByPriority.low, color: '#2196f3' },
    ];

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={9}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Tasks"
                                value={stats.totalTasks}
                                icon={<TaskIcon />}
                                color="#1976d2"
                                subtitle="All tasks"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Completed"
                                value={stats.completedTasks}
                                icon={<CompletedIcon />}
                                color="#4caf50"
                                subtitle={`${Math.round(stats.completionRate)}% completion rate`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Overdue"
                                value={stats.overdueTasks}
                                icon={<OverdueIcon />}
                                color="#f44336"
                                subtitle="Past due date"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Upcoming"
                                value={stats.upcomingTasks}
                                icon={<UpcomingIcon />}
                                color="#ff9800"
                                subtitle="Due this week"
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={3}>
                    <UserProfileCard />
                </Grid>
            </Grid>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                    <TaskDistributionChart
                        title="Tasks by Status"
                        data={statusData}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TaskDistributionChart
                        title="Tasks by Priority"
                        data={priorityData}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Today's Activity"
                        value={stats.recentActivity.today}
                        icon={<TrendingIcon />}
                        color="#9c27b0"
                        subtitle="Tasks updated today"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Weekly Activity"
                        value={stats.recentActivity.week}
                        icon={<TrendingIcon />}
                        color="#2196f3"
                        subtitle="Tasks updated this week"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};
