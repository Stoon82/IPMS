from typing import Optional, Dict, Any, List
import torch
from transformers import pipeline
import logging
from pathlib import Path
import numpy as np
from datetime import datetime, timedelta

from .config import config
from .model_manager import ModelManager
from .data_processor import DataProcessor

logger = logging.getLogger(__name__)

class IPMSAssistant:
    def __init__(
        self,
        model_manager: ModelManager,
        data_processor: DataProcessor
    ):
        self.model_manager = model_manager
        self.data_processor = data_processor
        self.pipeline = None
        self.sentiment_pipeline = None
        
    def initialize(
        self,
        model_path: Optional[str] = None,
        base_model_name: Optional[str] = None
    ):
        """Initialize the assistant with a model"""
        if model_path:
            # Load fine-tuned model
            self.model_manager.load_fine_tuned_model(
                model_path,
                base_model_name
            )
        else:
            # Load base model
            self.model_manager.load_model(base_model_name)
        
        # Setup generation pipeline
        self.pipeline = pipeline(
            "text-generation",
            model=self.model_manager.model,
            tokenizer=self.model_manager.tokenizer,
            device=config.model.device,
            max_length=config.model.max_length,
            temperature=config.model.temperature,
            top_p=config.model.top_p,
            pad_token_id=self.model_manager.tokenizer.eos_token_id
        )
        
        # Setup sentiment analysis pipeline
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            device=config.model.device
        )
    
    def generate_response(
        self,
        prompt: str,
        context: Optional[List[Dict[str, Any]]] = None,
        max_length: Optional[int] = None
    ) -> str:
        """Generate a response to user input"""
        if self.pipeline is None:
            raise ValueError("Assistant not initialized. Call initialize() first")
        
        # Get relevant context if provided
        context_text = ""
        if context:
            similar_docs = self.data_processor.search_similar(
                prompt,
                filter_metadata={"type": {"$in": context}}
            )
            context_text = "\n".join([doc.page_content for doc in similar_docs])
        
        # Construct full prompt
        full_prompt = prompt
        if context_text:
            full_prompt = f"Context:\n{context_text}\n\nUser: {prompt}\nAssistant:"
        
        # Generate response
        response = self.pipeline(
            full_prompt,
            max_length=max_length or config.model.max_length,
            num_return_sequences=1
        )[0]["generated_text"]
        
        # Clean up response (remove prompt)
        response = response.replace(full_prompt, "").strip()
        
        return response
    
    def analyze_journal_sentiment(
        self,
        entry: str
    ) -> Dict[str, float]:
        """Analyze sentiment of journal entry"""
        if self.sentiment_pipeline is None:
            raise ValueError("Sentiment pipeline not initialized")
        
        # Split entry into chunks if too long
        max_length = 512
        chunks = [entry[i:i + max_length] for i in range(0, len(entry), max_length)]
        
        # Analyze each chunk
        sentiments = []
        for chunk in chunks:
            result = self.sentiment_pipeline(chunk)[0]
            sentiments.append({
                "label": result["label"],
                "score": result["score"]
            })
        
        # Aggregate results
        positive_score = np.mean([s["score"] for s in sentiments if s["label"] == "POSITIVE"])
        negative_score = np.mean([s["score"] for s in sentiments if s["label"] == "NEGATIVE"])
        
        # Calculate overall sentiment
        sentiment = {
            "positive": float(positive_score) if not np.isnan(positive_score) else 0.0,
            "negative": float(negative_score) if not np.isnan(negative_score) else 0.0,
            "overall": "positive" if positive_score > negative_score else "negative",
            "confidence": float(max(positive_score, negative_score))
        }
        
        return sentiment
    
    def suggest_goals(
        self,
        user_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate goal suggestions based on user data"""
        # Process recent activities and journal entries
        activities = user_data.get("activities", [])
        journal_entries = user_data.get("journal_entries", [])
        current_goals = user_data.get("goals", [])
        
        # Analyze patterns and interests
        activity_types = {}
        for activity in activities:
            activity_type = activity["type"]
            if activity_type not in activity_types:
                activity_types[activity_type] = 0
            activity_types[activity_type] += 1
        
        # Get most common activities
        common_activities = sorted(
            activity_types.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        # Generate goal suggestions based on patterns
        suggestions = []
        
        # Activity-based goals
        for activity_type, count in common_activities:
            if not any(g["category"] == activity_type for g in current_goals):
                suggestions.append({
                    "title": f"Improve {activity_type}",
                    "description": f"Based on your frequent {activity_type} activities",
                    "category": activity_type,
                    "suggested_metrics": {
                        "frequency": "weekly",
                        "target": "30 minutes per session"
                    }
                })
        
        # Get relevant context for personalized suggestions
        context = self.data_processor.search_similar(
            "goal suggestions",
            filter_metadata={"type": {"$in": ["journal_entry", "goal"]}}
        )
        
        if context:
            # Generate personalized suggestions using the model
            prompt = f"""Based on the user's activities and interests, suggest 2-3 specific goals.
            Current activities: {', '.join(activity_types.keys())}
            Context: {' '.join([doc.page_content for doc in context])}
            
            Format each goal as:
            Title: [goal title]
            Description: [brief description]
            Category: [relevant category]
            Metrics: [suggested metrics]
            """
            
            response = self.generate_response(prompt)
            
            # Parse response and add to suggestions
            # (This is a simplified parsing, could be more robust)
            parts = response.split("Title:")
            for part in parts[1:]:  # Skip first empty part
                lines = part.strip().split("\n")
                suggestion = {
                    "title": lines[0].strip(),
                    "description": lines[1].replace("Description:", "").strip(),
                    "category": lines[2].replace("Category:", "").strip(),
                    "suggested_metrics": lines[3].replace("Metrics:", "").strip()
                }
                suggestions.append(suggestion)
        
        return suggestions
    
    def categorize_activity(
        self,
        activity_data: Dict[str, Any]
    ) -> str:
        """Categorize an activity based on its data"""
        # Convert activity data to text format
        activity_text = f"Activity: {activity_data.get('type', '')}\n"
        for key, value in activity_data.get('data', {}).items():
            activity_text += f"{key}: {value}\n"
        
        # Get similar activities for context
        similar_activities = self.data_processor.search_similar(
            activity_text,
            filter_metadata={"type": "activity"},
            k=3
        )
        
        # Generate categorization prompt
        prompt = f"""Categorize the following activity into one of these categories:
        - Work
        - Exercise
        - Learning
        - Entertainment
        - Social
        - Personal Care
        - Other
        
        Activity to categorize:
        {activity_text}
        
        Similar activities:
        {' '.join([doc.page_content for doc in similar_activities])}
        
        Category:
        """
        
        # Generate response
        response = self.generate_response(prompt)
        
        # Parse response and return category
        # (This is a simplified parsing, could be more robust)
        category = response.strip().split("\n")[-1]
        
        return category
