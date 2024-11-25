from setuptools import setup, find_packages

setup(
    name="ipms",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "torch>=2.0.0",
        "transformers>=4.30.0",
        "peft>=0.4.0",
        "bitsandbytes>=0.40.0",
        "accelerate>=0.20.0",
        "sentence-transformers>=2.2.0",
        "chromadb>=0.3.0",
        "typer[all]>=0.9.0",
        "rich>=13.0.0",
        "wandb>=0.15.0",
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "pydantic>=2.0.0",
        "fastapi>=0.100.0"
    ]
)
