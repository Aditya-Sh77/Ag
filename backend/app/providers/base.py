from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncGenerator, List, Dict, Any, Optional


@dataclass
class LLMResponse:
    content: str
    model: str
    provider: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    finish_reason: str = "stop"


class BaseProvider(ABC):
    def __init__(self, name: str, default_model: str):
        self.name = name
        self.default_model = default_model

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> LLMResponse:
        """Send chat completion request and return normalized response."""
        pass

    @abstractmethod
    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncGenerator[str, None]:
        """Yield chunks of string content for streaming response."""
        pass
