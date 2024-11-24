import pytest
from unittest.mock import patch
from ..services.ai_service import AIService
from ..services.ai_providers.factory import AIProviderFactory

@pytest.fixture
def mock_provider():
    class MockProvider:
        async def analyze_task(self, title, description):
            return {
                "priority": "high",
                "estimated_hours": 2,
                "tags": ["test", "mock"],
                "complexity_analysis": "Test analysis",
                "potential_challenges": ["Challenge 1", "Challenge 2"]
            }
            
        async def generate_task_summary(self, tasks):
            return {
                "overall_workload": "Medium",
                "key_priorities": ["Task 1", "Task 2"],
                "suggested_order": ["Task 1", "Task 2"],
                "time_estimate": 8
            }
            
        async def suggest_task_optimization(self, task, all_tasks):
            return {
                "dependencies": ["Task 2"],
                "optimization_suggestions": ["Suggestion 1"],
                "resource_allocation": "Test allocation",
                "timeline_recommendations": "Test timeline"
            }
    
    with patch.object(AIProviderFactory, 'get_provider', return_value=MockProvider()):
        yield

@pytest.mark.asyncio
async def test_analyze_task(mock_provider):
    result = await AIService.analyze_task("Test Task", "Test Description")
    assert result["priority"] == "high"
    assert result["estimated_hours"] == 2
    assert len(result["tags"]) > 0
    assert result["complexity_analysis"] == "Test analysis"
    assert len(result["potential_challenges"]) == 2

@pytest.mark.asyncio
async def test_generate_task_summary(mock_provider):
    tasks = [
        {"title": "Task 1", "description": "Description 1"},
        {"title": "Task 2", "description": "Description 2"}
    ]
    result = await AIService.generate_task_summary(tasks)
    assert result["overall_workload"] == "Medium"
    assert len(result["key_priorities"]) == 2
    assert len(result["suggested_order"]) == 2
    assert result["time_estimate"] == 8

@pytest.mark.asyncio
async def test_suggest_task_optimization(mock_provider):
    task = {"title": "Task 1", "description": "Description 1"}
    all_tasks = [
        {"title": "Task 1", "description": "Description 1"},
        {"title": "Task 2", "description": "Description 2"}
    ]
    result = await AIService.suggest_task_optimization(task, all_tasks)
    assert len(result["dependencies"]) == 1
    assert len(result["optimization_suggestions"]) == 1
    assert result["resource_allocation"] == "Test allocation"
    assert result["timeline_recommendations"] == "Test timeline"
