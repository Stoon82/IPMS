from abc import ABC, abstractmethod
from typing import List, Dict, Any

class AIProvider(ABC):
    @abstractmethod
    async def analyze_task(self, title: str, description: str) -> Dict[str, Any]:
        """Analyze a task and provide insights."""
        pass

    @abstractmethod
    async def generate_task_summary(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary of multiple tasks."""
        pass

    @abstractmethod
    async def suggest_task_optimization(self, task: Dict[str, Any], all_tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Suggest optimizations for a specific task."""
        pass
