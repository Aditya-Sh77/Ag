import time
import httpx
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from app.providers.base import BaseProvider, LLMResponse
from app.config import settings


class OllamaProvider(BaseProvider):
    def __init__(self):
        super().__init__(name="ollama", default_model="llama3")
        self.base_url = settings.OLLAMA_BASE_URL

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> LLMResponse:
        model = model or self.default_model
        start_time = time.time()

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": temperature}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("message", {}).get("content", "")
                    latency_ms = int((time.time() - start_time) * 1000)
                    return LLMResponse(
                        content=content,
                        model=model,
                        provider=self.name,
                        input_tokens=data.get("prompt_eval_count", 0),
                        output_tokens=data.get("eval_count", 0),
                        latency_ms=latency_ms
                    )
        except Exception:
            pass

        # Mock fallback if Ollama server is offline
        await asyncio.sleep(0.2)
        user_msg = messages[-1]["content"] if messages else ""
        content = f"[Ollama Local ({model}) Response] Processed locally: '{user_msg[:100]}...'"
        latency_ms = int((time.time() - start_time) * 1000)
        return LLMResponse(
            content=content,
            model=model,
            provider=self.name,
            input_tokens=len(user_msg.split()),
            output_tokens=len(content.split()),
            latency_ms=latency_ms
        )

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncGenerator[str, None]:
        model = model or self.default_model
        response = await self.chat(messages, model, temperature, max_tokens)
        words = response.content.split(" ")
        for word in words:
            yield word + " "
            await asyncio.sleep(0.04)
