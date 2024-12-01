import React from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { SvgIconProps } from '@mui/material';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<SvgIconProps>;
    color?: string;
    loading?: boolean;
    subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = '#1976d2',
    loading = false,
    subtitle
}) => {
    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: `${color}20`,
                            mr: 2
                        }}
                    >
                        {React.cloneElement(icon, { style: { color } })}
                    </Box>
                    <Box flexGrow={1}>
                        <Typography variant="body2" color="textSecondary">
                            {title}
                        </Typography>
                        <Typography variant="h6">
                            {loading ? <CircularProgress size={20} /> : value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
