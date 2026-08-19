from typing import Dict, Any
from app.config import settings
from app.providers.base import BaseProvider, LLMResponse
from app.providers.openai_provider import OpenAIProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider
from app.providers.openrouter_provider import OpenRouterProvider
from app.providers.claude_provider import ClaudeProvider
from app.providers.ollama_provider import OllamaProvider

PROVIDERS: Dict[str, BaseProvider] = {
    "openai": OpenAIProvider(),
    "gemini": GeminiProvider(),
    "groq": GroqProvider(),
    "openrouter": OpenRouterProvider(),
    "claude": ClaudeProvider(),
    "ollama": OllamaProvider(),
}


def get_provider(name: str) -> BaseProvider:
    provider_key = name.lower()
    if provider_key in PROVIDERS:
        return PROVIDERS[provider_key]
    
    # Smart fallback lookup
    if "groq" in provider_key or "llama" in provider_key:
        return PROVIDERS["groq"]
    elif "gemini" in provider_key:
        return PROVIDERS["gemini"]
    elif "openrouter" in provider_key or "deepseek" in provider_key:
        return PROVIDERS["openrouter"]
    elif "claude" in provider_key or "anthropic" in provider_key:
        return PROVIDERS["claude"]
    elif "ollama" in provider_key:
        return PROVIDERS["ollama"]
    
    return PROVIDERS["openai"]


def get_providers_status() -> Dict[str, Any]:
    """Returns availability status for each provider and logs to console on session start."""
    status = {
        "openai": {
            "name": "OpenAI (GPT)",
            "configured": bool(settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your_")),
            "default_model": "gpt-4o-mini",
            "supported_models": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
            "status_label": "READY" if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your_") else "SIMULATION / FALLBACK"
        },
        "gemini": {
            "name": "Google Gemini",
            "configured": bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_")),
            "default_model": "gemini-2.0-flash",
            "supported_models": ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
            "status_label": "READY" if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_") else "SIMULATION / FALLBACK"
        },
        "groq": {
            "name": "Groq LPU (Ultra Fast)",
            "configured": bool(settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("your_")),
            "default_model": "llama-3.3-70b-versatile",
            "supported_models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
            "status_label": "READY" if settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("your_") else "SIMULATION / FALLBACK"
        },
        "openrouter": {
            "name": "OpenRouter (Free Tier Models)",
            "configured": bool(settings.OPENROUTER_API_KEY and not settings.OPENROUTER_API_KEY.startswith("your_")),
            "default_model": "deepseek/deepseek-r1:free",
            "supported_models": ["deepseek/deepseek-r1:free", "meta-llama/llama-3.3-70b-instruct:free", "google/gemini-2.0-flash-lite-preview-02-05:free"],
            "status_label": "READY" if settings.OPENROUTER_API_KEY and not settings.OPENROUTER_API_KEY.startswith("your_") else "SIMULATION / FALLBACK"
        },
        "claude": {
            "name": "Anthropic Claude",
            "configured": bool(settings.CLAUDE_API_KEY and not settings.CLAUDE_API_KEY.startswith("your_")),
            "default_model": "claude-3-5-sonnet-20240620",
            "supported_models": ["claude-3-5-sonnet-20240620", "claude-3-haiku-20240307"],
            "status_label": "KEY NOT SET (Optional)"
        },
        "ollama": {
            "name": "Local Ollama",
            "configured": False,
            "default_model": "llama3",
            "supported_models": ["llama3", "mistral"],
            "status_label": "LOCAL (Optional)"
        }
    }
    return status


def print_provider_health_summary():
    """Prints a beautiful diagnostic health table to the console at session/application start."""
    status = get_providers_status()
    print("\n" + "=" * 70)
    print("      ENTERPRISE AI PLATFORM - MODEL PROVIDER HEALTH REPORT      ")
    print("=" * 70)
    for p_id, p_info in status.items():
        state_symbol = "🟢 [ACTIVE]" if p_info["configured"] else ("🟡 [FALLBACK]" if "SIMULATION" in p_info["status_label"] else "⚪ [OPTIONAL]")
        print(f" • {p_info['name']:<30} -> Status: {p_info['status_label']:<24} {state_symbol}")
    print("=" * 70 + "\n")
