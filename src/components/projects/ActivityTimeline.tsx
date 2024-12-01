import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Create as CreateIcon,
  Update as UpdateIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from '@mui/lab';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { ProjectActivity, ActivityType } from '../../types/user';
import { getProjectActivities } from '../../services/users';

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  create: <CreateIcon />,
  update: <UpdateIcon />,
  add_member: <PersonAddIcon />,
  remove_member: <PersonRemoveIcon />,
  add_task: <TaskIcon />,
  complete_task: <CheckCircleIcon />,
  link: <LinkIcon />,
  unlink: <LinkOffIcon />,
  note: <NoteIcon />,
};

const ACTIVITY_COLORS: Record<ActivityType, 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'> = {
  create: 'primary',
  update: 'info',
  add_member: 'success',
  remove_member: 'error',
  add_task: 'secondary',
  complete_task: 'success',
  link: 'info',
  unlink: 'warning',
  note: 'inherit',
};

interface ActivityTimelineProps {
  projectId: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ projectId }) => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: () => getProjectActivities(projectId)
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>Loading activities...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Activity Timeline
      </Typography>

      <Timeline>
        {activities.map((activity) => (
          <TimelineItem key={activity.id}>
            <TimelineOppositeContent color="text.secondary">
              <Tooltip title={format(new Date(activity.created_at), 'PPpp')}>
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </Typography>
              </Tooltip>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={ACTIVITY_COLORS[activity.action_type]}>
                {ACTIVITY_ICONS[activity.action_type]}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>

            <TimelineContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={activity.user.avatar_url}
                  sx={{ width: 24, height: 24 }}
                >
                  {activity.user.full_name.charAt(0)}
                </Avatar>
                <Typography>
                  <strong>{activity.user.full_name}</strong>{' '}
                  {activity.description}
                </Typography>
              </Box>
              {activity.metadata && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, ml: 4 }}
                >
                  {JSON.stringify(activity.metadata)}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};
