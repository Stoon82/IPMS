from typing import List, Dict, Any
from .ai_providers.factory import AIProviderFactory

class AIService:
    @staticmethod
    async def analyze_task(title: str, description: str) -> Dict[str, Any]:
        provider = AIProviderFactory.get_provider()
        return await provider.analyze_task(title, description)

    @staticmethod
    async def generate_task_summary(tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        provider = AIProviderFactory.get_provider()
        return await provider.generate_task_summary(tasks)

    @staticmethod
    async def suggest_task_optimization(task: Dict[str, Any], all_tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        provider = AIProviderFactory.get_provider()
        return await provider.suggest_task_optimization(task, all_tasks)