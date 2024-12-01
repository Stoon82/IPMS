import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Tab,
    Tabs,
    Typography,
    Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ProjectTasks } from '../components/projects/ProjectTasks';
import { ProjectIdeas } from '../components/projects/ProjectIdeas';
import { ConceptNotes } from '../components/projects/ConceptNotes';
import { ProjectDetails } from '../components/projects/ProjectDetails';
import { ProjectMindmaps } from '../components/projects/ProjectMindmaps';
import { getProject } from '../services/projects';
import { Project } from '../types/project';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`project-tabpanel-${index}`}
            aria-labelledby={`project-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export const ProjectDetail: React.FC = () => {
    const { id } = useParams();
    const [value, setValue] = useState(0);

    const { data: project, isLoading } = useQuery<Project>({
        queryKey: ['project', id],
        queryFn: () => getProject(Number(id))
    });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    if (!project) {
        return <Typography>Project not found</Typography>;
    }

    return (
        <Box>
            <Paper>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Details" />
                    <Tab label="Tasks" />
                    <Tab label="Ideas" />
                    <Tab label="Concept Notes" />
                    <Tab label="Mind Maps" />
                </Tabs>
            </Paper>

            <TabPanel value={value} index={0}>
                <ProjectDetails />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <ProjectTasks projectId={project.id} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <ProjectIdeas projectId={project.id} />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <ConceptNotes projectId={project.id} />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <ProjectMindmaps projectId={project.id} />
            </TabPanel>
        </Box>
    );
};
