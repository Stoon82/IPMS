from typing import List, Dict, Any
import aiohttp
from . import AIProvider
from ...config import settings

class HuggingFaceProvider(AIProvider):
    def __init__(self):
        self.api_key = settings.ai.huggingface_api_key
        self.model = settings.ai.model_name
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        self.headers = {"Authorization": f"Bearer {self.api_key}"}

    async def _generate_response(self, prompt: str) -> str:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.api_url,
                headers=self.headers,
                json={"inputs": prompt}
            ) as response:
                result = await response.json()
                return result[0].get("generated_text", "")

    async def analyze_task(self, title: str, description: str) -> Dict[str, Any]:
        prompt = f"""Analyze this task:
Title: {title}
Description: {description}

Provide analysis in JSON format with:
- priority (high/medium/low)
- estimated_hours (number)
- tags (list of relevant tags)
- complexity_analysis (text)
- potential_challenges (list)"""

        return await self._generate_response(prompt)

    async def generate_task_summary(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        tasks_text = "\n".join([f"- {task['title']}: {task['description']}" for task in tasks])
        prompt = f"""Analyze these tasks and provide a summary:
{tasks_text}

Provide analysis in JSON format with:
- overall_workload (text)
- key_priorities (list)
- suggested_order (list of task titles)
- time_estimate (total hours)"""

        return await self._generate_response(prompt)

    async def suggest_task_optimization(self, task: Dict[str, Any], all_tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        tasks_context = "\n".join([f"- {t['title']}: {t['description']}" for t in all_tasks])
        prompt = f"""Analyze this task in the context of all tasks:
Current Task: {task['title']}
Description: {task['description']}

Other Tasks:
{tasks_context}

Provide optimization suggestions in JSON format with:
- dependencies (list of related tasks)
- optimization_suggestions (list)
- resource_allocation (text)
- timeline_recommendations (text)"""

        return await self._generate_response(prompt)
