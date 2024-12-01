from transformers import (
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from peft import (
    prepare_model_for_kbit_training,
    LoraConfig,
    get_peft_model
)
from datasets import Dataset
import torch
from pathlib import Path
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

from .config import config
from .model_manager import ModelManager

logger = logging.getLogger(__name__)

class IPMSTrainer:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.training_config = config.training
    
    def prepare_training_data(
        self,
        texts: List[str],
        train_test_split: float = 0.2
    ) -> tuple[Dataset, Dataset]:
        """Prepare dataset for training"""
        # Convert texts to dataset format
        dataset = Dataset.from_dict({
            "text": texts
        })
        
        # Split dataset
        dataset = dataset.train_test_split(
            test_size=train_test_split,
            shuffle=True,
            seed=42
        )
        
        return dataset["train"], dataset["test"]
    
    def prepare_model_for_training(
        self,
        model_name: Optional[str] = None,
        lora_config: Optional[Dict[str, Any]] = None
    ):
        """Prepare model for training with LoRA"""
        # Load base model if not already loaded
        if self.model_manager.model is None:
            self.model_manager.load_model(model_name)
        
        model = self.model_manager.model
        
        # Prepare model for k-bit training if using quantization
        if config.model.quantization in ["4bit", "8bit"]:
            model = prepare_model_for_kbit_training(model)
        
        # Configure LoRA
        lora_config = lora_config or {
            "r": self.training_config.lora_r,
            "lora_alpha": self.training_config.lora_alpha,
            "lora_dropout": self.training_config.lora_dropout,
            "bias": "none",
            "task_type": "CAUSAL_LM"
        }
        
        peft_config = LoraConfig(**lora_config)
        model = get_peft_model(model, peft_config)
        
        return model
    
    def train(
        self,
        train_dataset: Dataset,
        eval_dataset: Optional[Dataset] = None,
        output_dir: Optional[str] = None,
        training_args: Optional[Dict[str, Any]] = None
    ):
        """Train the model"""
        if self.model_manager.model is None:
            raise ValueError("Model not loaded. Call prepare_model_for_training first")
        
        # Setup output directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = output_dir or f"fine_tuned_model_{timestamp}"
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure training arguments
        default_training_args = {
            "output_dir": str(output_dir),
            "num_train_epochs": self.training_config.num_epochs,
            "per_device_train_batch_size": self.training_config.batch_size,
            "gradient_accumulation_steps": 4,
            "learning_rate": self.training_config.learning_rate,
            "warmup_steps": self.training_config.warmup_steps,
            "logging_steps": 10,
            "save_steps": 100,
            "evaluation_strategy": "steps" if eval_dataset else "no",
            "eval_steps": 100 if eval_dataset else None,
            "save_total_limit": 3,
            "load_best_model_at_end": True if eval_dataset else False,
            "report_to": "wandb",  # Use Weights & Biases for tracking
        }
        
        if training_args:
            default_training_args.update(training_args)
        
        training_args = TrainingArguments(**default_training_args)
        
        # Setup data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.model_manager.tokenizer,
            mlm=False
        )
        
        # Initialize trainer
        trainer = Trainer(
            model=self.model_manager.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=data_collator
        )
        
        # Train model
        logger.info("Starting training...")
        trainer.train()
        
        # Save the model
        logger.info(f"Saving model to {output_dir}")
        trainer.save_model()
        
        # Save to model registry
        self.model_manager.save_fine_tuned_model(
            output_dir=str(output_dir),
            metadata={
                "training_args": default_training_args,
                "dataset_size": len(train_dataset)
            }
        )
        
        return trainer
