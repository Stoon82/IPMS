from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig
)
from peft import PeftModel, LoraConfig
import torch
from pathlib import Path
from typing import Optional, Dict, Any
import json
import logging
from .config import config

logger = logging.getLogger(__name__)

class ModelManager:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self._setup_model_path()
        
    def _setup_model_path(self):
        """Ensure model directory exists and contains model info"""
        self.model_path = Path(config.model.model_path)
        self.model_path.mkdir(parents=True, exist_ok=True)
        
        # Create/load model registry
        self.registry_path = self.model_path / "model_registry.json"
        if self.registry_path.exists():
            with open(self.registry_path, 'r') as f:
                self.registry = json.load(f)
        else:
            self.registry = {}
            self._save_registry()
    
    def _save_registry(self):
        """Save model registry to disk"""
        with open(self.registry_path, 'w') as f:
            json.dump(self.registry, f, indent=2)
    
    def load_model(
        self,
        model_name: Optional[str] = None,
        quantization: Optional[str] = None
    ):
        """Load a model with optional quantization"""
        model_name = model_name or config.model.model_name
        quantization = quantization or config.model.quantization
        
        logger.info(f"Loading model: {model_name}")
        
        # Configure quantization
        compute_dtype = torch.float16
        bnb_config = None
        
        if quantization == "4bit":
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=compute_dtype,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
        
        # Load model and tokenizer
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
            cache_dir=str(config.cache_dir)
        )
        
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            trust_remote_code=True,
            cache_dir=str(config.cache_dir)
        )
        
        # Register model
        if model_name not in self.registry:
            self.registry[model_name] = {
                "base_model": model_name,
                "quantization": quantization,
                "fine_tuned_versions": []
            }
            self._save_registry()
        
        return self.model, self.tokenizer
    
    def save_fine_tuned_model(
        self,
        output_dir: str,
        base_model_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Save a fine-tuned model and update registry"""
        if self.model is None:
            raise ValueError("No model loaded to save")
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save model and tokenizer
        self.model.save_pretrained(output_path)
        self.tokenizer.save_pretrained(output_path)
        
        # Update registry
        base_model_name = base_model_name or config.model.model_name
        version_info = {
            "path": str(output_path),
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.registry[base_model_name]["fine_tuned_versions"].append(version_info)
        self._save_registry()
        
        logger.info(f"Saved fine-tuned model to: {output_path}")
    
    def load_fine_tuned_model(
        self,
        model_path: str,
        base_model_name: Optional[str] = None
    ):
        """Load a fine-tuned model"""
        if base_model_name is None:
            # Try to find base model from registry
            for model_info in self.registry.values():
                for version in model_info["fine_tuned_versions"]:
                    if version["path"] == model_path:
                        base_model_name = model_info["base_model"]
                        break
                if base_model_name:
                    break
        
        if base_model_name is None:
            raise ValueError("Could not determine base model name")
        
        # First load base model
        self.load_model(base_model_name)
        
        # Then load fine-tuned weights
        self.model = PeftModel.from_pretrained(
            self.model,
            model_path,
            device_map="auto"
        )
        
        logger.info(f"Loaded fine-tuned model from: {model_path}")
        return self.model, self.tokenizer
    
    def get_model_info(self, model_name: Optional[str] = None) -> Dict[str, Any]:
        """Get information about a model from the registry"""
        if model_name is None:
            return self.registry
        return self.registry.get(model_name, {})
