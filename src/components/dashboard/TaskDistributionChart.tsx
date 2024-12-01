import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

interface ChartData {
    name: string;
    value: number;
    color: string;
}

interface TaskDistributionChartProps {
    title: string;
    data: ChartData[];
}

export const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({
    title,
    data,
}) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({
                                cx,
                                cy,
                                midAngle,
                                innerRadius,
                                outerRadius,
                                value,
                                name,
                            }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        fill="#666"
                                        textAnchor={x > cx ? 'start' : 'end'}
                                        dominantBaseline="central"
                                    >
                                        {`${name} (${value})`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
