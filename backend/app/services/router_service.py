from typing import List, Dict, Tuple
from app.providers import get_provider, BaseProvider

PRICING_PER_1K = {
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gpt-4o": {"input": 0.0025, "output": 0.010},
    "gemini-2.0-flash": {"input": 0.0001, "output": 0.0004},
    "gemini-1.5-flash": {"input": 0.000075, "output": 0.0003},
    "llama-3.3-70b-versatile": {"input": 0.00059, "output": 0.00079},
    "llama-3.1-8b-instant": {"input": 0.00005, "output": 0.00008},
    "deepseek/deepseek-r1:free": {"input": 0.0, "output": 0.0},
    "claude-3-5-sonnet-20240620": {"input": 0.003, "output": 0.015},
    "llama3": {"input": 0.0, "output": 0.0},
}

MODEL_METRICS = {
    "llama-3.1-8b-instant": {"avg_latency_ms": 110, "quality": 0.86, "provider": "groq"},
    "llama-3.3-70b-versatile": {"avg_latency_ms": 190, "quality": 0.94, "provider": "groq"},
    "gemini-2.0-flash": {"avg_latency_ms": 180, "quality": 0.92, "provider": "gemini"},
    "gpt-4o-mini": {"avg_latency_ms": 250, "quality": 0.90, "provider": "openai"},
    "deepseek/deepseek-r1:free": {"avg_latency_ms": 350, "quality": 0.93, "provider": "openrouter"},
}

CATEGORY_KEYWORDS = {
    "coding": ["code", "python", "javascript", "function", "bug", "algorithm", "api", "react", "html", "css", "sql"],
    "math": ["math", "calculate", "equation", "solve", "probability", "statistics", "integral", "derivative"],
    "reasoning": ["analysis", "complex", "strategy", "reason", "architecture", "design", "evaluate"],
}


def classify_prompt_intent(prompt: str) -> str:
    prompt_lower = prompt.lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in prompt_lower for kw in keywords):
            return cat
    return "general"


def select_model_and_provider(
    routing_mode: str,
    requested_model: str = "gpt-4o-mini",
    prompt: str = ""
) -> Tuple[BaseProvider, str]:
    mode = routing_mode.lower()

    if mode == "manual":
        if "groq" in requested_model or "llama-3" in requested_model or "mixtral" in requested_model:
            return get_provider("groq"), requested_model
        elif "openrouter" in requested_model or "free" in requested_model or "deepseek" in requested_model:
            return get_provider("openrouter"), requested_model
        elif "gemini" in requested_model:
            return get_provider("gemini"), requested_model
        elif "claude" in requested_model or "anthropic" in requested_model:
            return get_provider("claude"), requested_model
        elif "ollama" in requested_model:
            return get_provider("ollama"), requested_model
        else:
            return get_provider("openai"), requested_model

    elif mode == "auto":
        intent = classify_prompt_intent(prompt)
        if intent == "coding":
            return get_provider("groq"), "llama-3.3-70b-versatile"
        elif intent == "math":
            return get_provider("gemini"), "gemini-2.0-flash"
        elif intent == "reasoning":
            return get_provider("openai"), "gpt-4o-mini"
        else:
            return get_provider("groq"), "llama-3.3-70b-versatile"

    elif mode == "cost":
        # Cheapest/Free provider option
        return get_provider("groq"), "llama-3.1-8b-instant"

    elif mode == "fastest":
        # Ultra low latency Groq engine
        return get_provider("groq"), "llama-3.1-8b-instant"

    elif mode == "balanced":
        return get_provider("gemini"), "gemini-2.0-flash"

    return get_provider("openai"), "gpt-4o-mini"
