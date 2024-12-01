import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { aiService } from '../services/ai';

export const useAIAnalysis = () => {
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    const {
        data: analysis,
        isLoading: isAnalyzing,
        error: analysisError,
        mutate: analyzeTask,
    } = useMutation({
        mutationFn: aiService.analyzeTask,
    });

    const {
        data: optimization,
        isLoading: isOptimizing,
        error: optimizationError,
        mutate: suggestOptimization,
    } = useMutation({
        mutationFn: aiService.suggestOptimization,
    });

    const openAnalysis = () => setIsAnalysisOpen(true);
    const closeAnalysis = () => setIsAnalysisOpen(false);

    return {
        isAnalysisOpen,
        openAnalysis,
        closeAnalysis,
        analysis,
        isAnalyzing,
        analysisError,
        analyzeTask,
        optimization,
        isOptimizing,
        optimizationError,
        suggestOptimization,
    };
};
