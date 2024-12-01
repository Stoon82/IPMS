import { useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { isAfter, isBefore, startOfDay, endOfDay, addDays } from 'date-fns';

export interface TaskStats {
    totalTasks: number;
    completedTasks: number;
    upcomingTasks: number;
    overdueTasks: number;
    tasksByStatus: Record<TaskStatus, number>;
    tasksByPriority: Record<TaskPriority, number>;
    completionRate: number;
    recentActivity: {
        today: number;
        week: number;
    };
}

export const useTaskStats = (tasks: Task[]): TaskStats => {
    return useMemo(() => {
        const now = new Date();
        const today = startOfDay(now);
        const weekAgo = startOfDay(addDays(now, -7));

        const stats: TaskStats = {
            totalTasks: tasks.length,
            completedTasks: 0,
            upcomingTasks: 0,
            overdueTasks: 0,
            tasksByStatus: {
                todo: 0,
                in_progress: 0,
                done: 0,
            },
            tasksByPriority: {
                low: 0,
                medium: 0,
                high: 0,
            },
            completionRate: 0,
            recentActivity: {
                today: 0,
                week: 0,
            },
        };

        tasks.forEach(task => {
            // Update status counts
            stats.tasksByStatus[task.status]++;

            // Update priority counts
            stats.tasksByPriority[task.priority]++;

            // Count completed tasks
            if (task.status === 'done') {
                stats.completedTasks++;
            }

            // Check due dates
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                if (task.status !== 'done') {
                    if (isBefore(dueDate, today)) {
                        stats.overdueTasks++;
                    } else if (isAfter(dueDate, today)) {
                        stats.upcomingTasks++;
                    }
                }
            }

            // Check recent activity
            const updatedAt = new Date(task.updated_at);
            if (isAfter(updatedAt, today)) {
                stats.recentActivity.today++;
            }
            if (isAfter(updatedAt, weekAgo)) {
                stats.recentActivity.week++;
            }
        });

        // Calculate completion rate
        stats.completionRate = stats.totalTasks > 0
            ? (stats.completedTasks / stats.totalTasks) * 100
            : 0;

        return stats;
    }, [tasks]);
};
