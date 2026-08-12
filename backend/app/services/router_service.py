from typing import List, Dict, Tuple
from app.providers import get_provider, BaseProvider

PRICING_PER_1K = {
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gemini-2.5-flash": {"input": 0.000075, "output": 0.0003},
    "claude-3-5-sonnet-20240620": {"input": 0.003, "output": 0.015},
    "llama3": {"input": 0.0, "output": 0.0},
}

MODEL_METRICS = {
    "gpt-4o-mini": {"avg_latency_ms": 280, "quality": 0.88, "provider": "openai"},
    "gemini-2.5-flash": {"avg_latency_ms": 210, "quality": 0.85, "provider": "gemini"},
    "claude-3-5-sonnet-20240620": {"avg_latency_ms": 320, "quality": 0.95, "provider": "claude"},
    "llama3": {"avg_latency_ms": 180, "quality": 0.80, "provider": "ollama"},
}

CATEGORY_KEYWORDS = {
    "coding": ["code", "python", "javascript", "function", "bug", "algorithm", "api", "react", "html", "css"],
    "math": ["math", "calculate", "equation", "solve", "probability", "statistics", "integral"],
    "reasoning": ["analysis", "complex", "strategy", "reason", "architecture", "design"],
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
        if "claude" in requested_model or "anthropic" in requested_model:
            return get_provider("claude"), requested_model
        elif "gemini" in requested_model:
            return get_provider("gemini"), requested_model
        elif "llama" in requested_model or "ollama" in requested_model:
            return get_provider("ollama"), requested_model
        else:
            return get_provider("openai"), requested_model

    elif mode == "auto":
        intent = classify_prompt_intent(prompt)
        if intent == "coding":
            return get_provider("openai"), "gpt-4o-mini"
        elif intent == "math":
            return get_provider("gemini"), "gemini-2.5-flash"
        elif intent == "reasoning":
            return get_provider("claude"), "claude-3-5-sonnet-20240620"
        else:
            return get_provider("gemini"), "gemini-2.5-flash"

    elif mode == "cost":
        # Free local model or cheapest cloud model
        return get_provider("gemini"), "gemini-2.5-flash"

    elif mode == "fastest":
        fastest_model = min(MODEL_METRICS.items(), key=lambda x: x[1]["avg_latency_ms"])
        provider_name = fastest_model[1]["provider"]
        return get_provider(provider_name), fastest_model[0]

    elif mode == "balanced":
        return get_provider("gemini"), "gemini-2.5-flash"

    return get_provider("openai"), "gpt-4o-mini"
