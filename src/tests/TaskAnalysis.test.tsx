import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskAnalysis } from '../components/tasks/TaskAnalysis';

const mockAnalysis = {
    priority: 'high',
    estimated_hours: 4,
    tags: ['frontend', 'urgent'],
    complexity_analysis: 'Medium complexity task',
    potential_challenges: ['Time constraint', 'Technical complexity']
};

describe('TaskAnalysis Component', () => {
    it('renders loading state correctly', () => {
        render(
            <TaskAnalysis
                open={true}
                onClose={() => {}}
                analysis={null}
                isLoading={true}
                error={null}
            />
        );
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
        render(
            <TaskAnalysis
                open={true}
                onClose={() => {}}
                analysis={null}
                isLoading={false}
                error={new Error('Test error')}
            />
        );
        
        expect(screen.getByText(/error loading analysis/i)).toBeInTheDocument();
    });

    it('renders analysis data correctly', () => {
        render(
            <TaskAnalysis
                open={true}
                onClose={() => {}}
                analysis={mockAnalysis}
                isLoading={false}
                error={null}
            />
        );
        
        expect(screen.getByText(mockAnalysis.priority)).toBeInTheDocument();
        expect(screen.getByText(`${mockAnalysis.estimated_hours} hours`)).toBeInTheDocument();
        expect(screen.getByText(mockAnalysis.complexity_analysis)).toBeInTheDocument();
        mockAnalysis.potential_challenges.forEach(challenge => {
            expect(screen.getByText(challenge)).toBeInTheDocument();
        });
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();
        render(
            <TaskAnalysis
                open={true}
                onClose={onClose}
                analysis={mockAnalysis}
                isLoading={false}
                error={null}
            />
        );
        
        fireEvent.click(screen.getByText('Close'));
        expect(onClose).toHaveBeenCalled();
    });
});
