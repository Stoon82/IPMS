from typing import Dict, Type
from . import AIProvider
from .openai_provider import OpenAIProvider
from .ollama_provider import OllamaProvider
from .huggingface_provider import HuggingFaceProvider
from ...config import settings

class AIProviderFactory:
    _providers: Dict[str, Type[AIProvider]] = {
        'openai': OpenAIProvider,
        'ollama': OllamaProvider,
        'huggingface': HuggingFaceProvider,
    }

    @classmethod
    def get_provider(cls) -> AIProvider:
        """Get the configured AI provider instance."""
        provider_class = cls._providers.get(settings.ai.provider)
        if not provider_class:
            raise ValueError(f"Unsupported AI provider: {settings.ai.provider}")
        
        return provider_class()
