from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
import logging
from pathlib import Path

from .config import config

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        
        self.embeddings = HuggingFaceEmbeddings(
            model_name=config.vectorstore.embedding_model,
            cache_folder=str(config.cache_dir)
        )
        
        self.vectorstore = self._initialize_vectorstore()
    
    def _initialize_vectorstore(self):
        """Initialize or load existing vector store"""
        persist_directory = Path(config.vectorstore.persist_directory)
        persist_directory.mkdir(parents=True, exist_ok=True)
        
        return Chroma(
            collection_name=config.vectorstore.collection_name,
            embedding_function=self.embeddings,
            persist_directory=str(persist_directory)
        )
    
    def process_journal_entries(
        self,
        entries: List[Dict[str, Any]]
    ) -> List[Document]:
        """Process journal entries into training documents"""
        documents = []
        
        for entry in entries:
            # Combine entry data
            text = f"Journal Entry:\n{entry['content']}\n"
            if entry.get('mood'):
                text += f"Mood: {entry['mood']}\n"
            if entry.get('tags'):
                text += f"Tags: {', '.join(entry['tags'])}\n"
            
            metadata = {
                "type": "journal_entry",
                "timestamp": entry.get('created_at', datetime.now().isoformat()),
                "mood": entry.get('mood'),
                "tags": entry.get('tags', [])
            }
            
            # Split into chunks
            chunks = self.text_splitter.create_documents(
                texts=[text],
                metadatas=[metadata]
            )
            documents.extend(chunks)
        
        return documents
    
    def process_activities(
        self,
        activities: List[Dict[str, Any]]
    ) -> List[Document]:
        """Process activity data into training documents"""
        documents = []
        
        for activity in activities:
            # Convert activity data to text
            text = f"Activity Type: {activity['type']}\n"
            for key, value in activity['data'].items():
                text += f"{key}: {value}\n"
            
            metadata = {
                "type": "activity",
                "activity_type": activity['type'],
                "timestamp": activity.get('timestamp', datetime.now().isoformat())
            }
            
            # Split into chunks
            chunks = self.text_splitter.create_documents(
                texts=[text],
                metadatas=[metadata]
            )
            documents.extend(chunks)
        
        return documents
    
    def process_goals(
        self,
        goals: List[Dict[str, Any]]
    ) -> List[Document]:
        """Process goals and progress data into training documents"""
        documents = []
        
        for goal in goals:
            # Combine goal information
            text = f"Goal: {goal['title']}\n"
            text += f"Description: {goal['description']}\n"
            text += f"Category: {goal['category']}\n"
            text += f"Status: {goal['status']}\n"
            text += f"Progress: {goal['progress']}%\n"
            
            if goal.get('metrics'):
                text += "Metrics:\n"
                for key, value in goal['metrics'].items():
                    text += f"- {key}: {value}\n"
            
            metadata = {
                "type": "goal",
                "category": goal['category'],
                "status": goal['status'],
                "timestamp": goal.get('created_at', datetime.now().isoformat())
            }
            
            # Split into chunks
            chunks = self.text_splitter.create_documents(
                texts=[text],
                metadatas=[metadata]
            )
            documents.extend(chunks)
        
        return documents
    
    def add_to_vectorstore(self, documents: List[Document]):
        """Add documents to vector store"""
        self.vectorstore.add_documents(documents)
        self.vectorstore.persist()
    
    def search_similar(
        self,
        query: str,
        filter_metadata: Optional[Dict[str, Any]] = None,
        k: int = 5
    ) -> List[Document]:
        """Search for similar documents"""
        return self.vectorstore.similarity_search(
            query,
            filter=filter_metadata,
            k=k
        )
    
    def get_training_data(
        self,
        include_types: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Get processed data for training"""
        # Retrieve all documents
        filter_dict = None
        if include_types:
            filter_dict = {"type": {"$in": include_types}}
        
        documents = self.vectorstore.get(
            filter=filter_dict
        )
        
        # Convert to DataFrame
        data = []
        for doc in documents:
            data.append({
                "text": doc.page_content,
                "type": doc.metadata["type"],
                "timestamp": doc.metadata["timestamp"],
                **{k: v for k, v in doc.metadata.items() 
                   if k not in ["type", "timestamp"]}
            })
        
        return pd.DataFrame(data)
