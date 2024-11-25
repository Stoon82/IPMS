import typer
from typing import Optional, List
from pathlib import Path
import json
from rich.console import Console
from rich.table import Table
import logging

from .config import config
from .model_manager import ModelManager
from .trainer import IPMSTrainer
from .data_processor import DataProcessor
from .assistant import IPMSAssistant

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Typer app
app = typer.Typer()
console = Console()

# Initialize components
model_manager = ModelManager()
data_processor = DataProcessor()
trainer = IPMSTrainer(model_manager)
assistant = IPMSAssistant(model_manager, data_processor)

@app.command()
def download_model(
    model_name: str = typer.Option(
        config.model.model_name,
        help="Name or path of the model to download"
    ),
    quantization: str = typer.Option(
        config.model.quantization,
        help="Quantization method (4bit, 8bit, or none)"
    )
):
    """Download and prepare a model for use"""
    try:
        console.print(f"[bold blue]Downloading model: {model_name}[/bold blue]")
        model_manager.load_model(model_name, quantization)
        console.print("[bold green]Model downloaded successfully![/bold green]")
    except Exception as e:
        console.print(f"[bold red]Error downloading model: {str(e)}[/bold red]")

@app.command()
def list_models():
    """List all available models in the registry"""
    registry = model_manager.get_model_info()
    
    table = Table(title="Available Models")
    table.add_column("Base Model", style="cyan")
    table.add_column("Quantization", style="magenta")
    table.add_column("Fine-tuned Versions", style="green")
    
    for model_name, info in registry.items():
        table.add_row(
            model_name,
            info.get("quantization", "none"),
            str(len(info.get("fine_tuned_versions", [])))
        )
    
    console.print(table)

@app.command()
def prepare_training_data(
    output_file: Path = typer.Option(
        ...,
        help="Path to save the processed training data"
    ),
    data_types: Optional[List[str]] = typer.Option(
        None,
        help="Types of data to include (journal_entry, activity, goal)"
    )
):
    """Prepare and save training data"""
    try:
        console.print("[bold blue]Preparing training data...[/bold blue]")
        
        # Get training data
        df = data_processor.get_training_data(include_types=data_types)
        
        # Save to file
        df.to_csv(output_file, index=False)
        console.print(f"[bold green]Saved {len(df)} records to {output_file}[/bold green]")
    
    except Exception as e:
        console.print(f"[bold red]Error preparing data: {str(e)}[/bold red]")

@app.command()
def train(
    training_data: Path = typer.Option(
        ...,
        help="Path to training data CSV file"
    ),
    output_dir: Path = typer.Option(
        ...,
        help="Directory to save the fine-tuned model"
    ),
    base_model: str = typer.Option(
        config.model.model_name,
        help="Base model to fine-tune"
    ),
    epochs: int = typer.Option(
        config.training.num_epochs,
        help="Number of training epochs"
    ),
    batch_size: int = typer.Option(
        config.training.batch_size,
        help="Training batch size"
    )
):
    """Fine-tune a model on IPMS data"""
    try:
        console.print("[bold blue]Starting training process...[/bold blue]")
        
        # Prepare model
        model = trainer.prepare_model_for_training(base_model)
        
        # Load and prepare data
        import pandas as pd
        df = pd.read_csv(training_data)
        train_data, eval_data = trainer.prepare_training_data(df["text"].tolist())
        
        # Train model
        trainer.train(
            train_data,
            eval_data,
            output_dir=str(output_dir),
            training_args={
                "num_train_epochs": epochs,
                "per_device_train_batch_size": batch_size
            }
        )
        
        console.print("[bold green]Training completed successfully![/bold green]")
    
    except Exception as e:
        console.print(f"[bold red]Error during training: {str(e)}[/bold red]")

@app.command()
def test_generation(
    prompt: str = typer.Argument(..., help="Input prompt for the model"),
    model_path: Optional[Path] = typer.Option(
        None,
        help="Path to fine-tuned model (if not provided, uses base model)"
    ),
    max_length: Optional[int] = typer.Option(
        None,
        help="Maximum length of generated text"
    )
):
    """Test text generation with the model"""
    try:
        console.print("[bold blue]Initializing assistant...[/bold blue]")
        assistant.initialize(
            model_path=str(model_path) if model_path else None
        )
        
        console.print("\n[bold yellow]Generating response...[/bold yellow]")
        response = assistant.generate_response(
            prompt,
            max_length=max_length
        )
        
        console.print("\n[bold green]Response:[/bold green]")
        console.print(response)
    
    except Exception as e:
        console.print(f"[bold red]Error generating response: {str(e)}[/bold red]")

if __name__ == "__main__":
    app()
