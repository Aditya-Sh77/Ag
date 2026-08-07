from app.providers.base import BaseProvider, LLMResponse
from app.providers.openai_provider import OpenAIProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.ollama_provider import OllamaProvider

PROVIDERS: dict[str, BaseProvider] = {
    "openai": OpenAIProvider(),
    "gemini": GeminiProvider(),
    "ollama": OllamaProvider(),
}


def get_provider(name: str) -> BaseProvider:
    return PROVIDERS.get(name.lower(), PROVIDERS["openai"])
