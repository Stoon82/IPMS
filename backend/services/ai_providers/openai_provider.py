from typing import List, Dict, Any
import openai
from . import AIProvider
from ...config import settings

class OpenAIProvider(AIProvider):
    def __init__(self):
        openai.api_key = settings.ai.openai_api_key

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

        response = await openai.ChatCompletion.acreate(
            model=settings.ai.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content

    async def generate_task_summary(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        tasks_text = "\n".join([f"- {task['title']}: {task['description']}" for task in tasks])
        prompt = f"""Analyze these tasks and provide a summary:
{tasks_text}

Provide analysis in JSON format with:
- overall_workload (text)
- key_priorities (list)
- suggested_order (list of task titles)
- time_estimate (total hours)"""

        response = await openai.ChatCompletion.acreate(
            model=settings.ai.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content

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

        response = await openai.ChatCompletion.acreate(
            model=settings.ai.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content
