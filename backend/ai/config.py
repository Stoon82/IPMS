import os
from pathlib import Path
from typing import Dict, Any
from pydantic import BaseModel
import torch

class ModelConfig(BaseModel):
    model_name: str = "meta-llama/Llama-2-7b-chat-hf"  # Default model
    model_path: str = "models"  # Local path to store models
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    max_length: int = 2048
    temperature: float = 0.7
    top_p: float = 0.95
    quantization: str = "4bit"  # 4bit quantization for efficiency

class VectorStoreConfig(BaseModel):
    engine: str = "chroma"
    collection_name: str = "ipms_data"
    embedding_model: str = "all-MiniLM-L6-v2"
    persist_directory: str = "vectorstore"

class TrainingConfig(BaseModel):
    batch_size: int = 4
    learning_rate: float = 2e-5
    num_epochs: int = 3
    warmup_steps: int = 100
    lora_r: int = 8
    lora_alpha: int = 16
    lora_dropout: float = 0.05

class AIConfig(BaseModel):
    model: ModelConfig = ModelConfig()
    vectorstore: VectorStoreConfig = VectorStoreConfig()
    training: TrainingConfig = TrainingConfig()
    
    # Paths
    base_path: Path = Path(__file__).parent
    cache_dir: Path = base_path / "cache"
    models_dir: Path = base_path / "models"
    data_dir: Path = base_path / "data"
    
    def __init__(self, **data: Any):
        super().__init__(**data)
        # Create directories
        for path in [self.cache_dir, self.models_dir, self.data_dir]:
            path.mkdir(parents=True, exist_ok=True)

# Default configuration
config = AIConfig()
