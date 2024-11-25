from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pathlib import Path

from database import get_db
from models.user import User
from auth.utils import get_current_user
from ai import (
    config,
    ModelManager,
    DataProcessor,
    IPMSAssistant
)

router = APIRouter(tags=["ai"])

# Initialize AI components
model_manager = ModelManager()
data_processor = DataProcessor()
assistant = IPMSAssistant(model_manager, data_processor)

@router.post("/ai/initialize")
async def initialize_ai(
    model_path: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Initialize or switch AI model"""
    try:
        assistant.initialize(model_path=model_path)
        return {"message": "AI assistant initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/generate")
async def generate_response(
    prompt: str = Body(...),
    context_types: Optional[List[str]] = Body(None),
    max_length: Optional[int] = Body(None),
    current_user: User = Depends(get_current_user)
):
    """Generate AI response with optional context"""
    try:
        response = assistant.generate_response(
            prompt,
            context=context_types,
            max_length=max_length
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/analyze/journal")
async def analyze_journal_sentiment(
    entry: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Analyze sentiment of journal entry"""
    try:
        sentiment = assistant.analyze_journal_sentiment(entry)
        return {"sentiment": sentiment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/suggest/goals")
async def get_goal_suggestions(
    user_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated goal suggestions"""
    try:
        suggestions = assistant.suggest_goals(user_data)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/categorize/activity")
async def categorize_activity(
    activity_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Categorize activity using AI"""
    try:
        category = assistant.categorize_activity(activity_data)
        return {"category": category}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/process/data")
async def process_user_data(
    data_types: List[str] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process user data for AI training"""
    try:
        documents = []
        
        if "journal_entry" in data_types:
            entries = db.query(JournalEntry).filter(
                JournalEntry.user_id == current_user.id
            ).all()
            documents.extend(data_processor.process_journal_entries(entries))
        
        if "activity" in data_types:
            activities = db.query(Activity).filter(
                Activity.user_id == current_user.id
            ).all()
            documents.extend(data_processor.process_activities(activities))
        
        if "goal" in data_types:
            goals = db.query(Goal).filter(
                Goal.user_id == current_user.id
            ).all()
            documents.extend(data_processor.process_goals(goals))
        
        data_processor.add_to_vectorstore(documents)
        
        return {
            "message": f"Processed {len(documents)} documents",
            "types": data_types
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
