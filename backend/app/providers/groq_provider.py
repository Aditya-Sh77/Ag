import time
import asyncio
import traceback
from typing import List, Dict, Any, Optional, AsyncGenerator
from app.providers.base import BaseProvider, LLMResponse
from app.config import settings


class GroqProvider(BaseProvider):
    """
    Groq Cloud Provider - High speed inference engine for open models
    Supports: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768, gemma2-9b-it
    """
    def __init__(self):
        super().__init__(name="groq", default_model="llama-3.3-70b-versatile")
        self.api_key = settings.GROQ_API_KEY

    def is_configured(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith("your_"))

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> LLMResponse:
        model = model or self.default_model
        start_time = time.time()

        if self.is_configured():
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(
                    api_key=self.api_key,
                    base_url="https://api.groq.com/openai/v1"
                )

                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature
                }
                if max_tokens is not None:
                    kwargs["max_tokens"] = max_tokens

                response = await client.chat.completions.create(**kwargs)
                latency_ms = int((time.time() - start_time) * 1000)
                choice = response.choices[0]
                usage = response.usage

                return LLMResponse(
                    content=choice.message.content or "",
                    model=model,
                    provider=self.name,
                    input_tokens=usage.prompt_tokens if usage else 0,
                    output_tokens=usage.completion_tokens if usage else 0,
                    latency_ms=latency_ms,
                    finish_reason=choice.finish_reason or "stop"
                )
            except Exception as e:
                print("\n" + "=" * 60)
                print(f"[GROQ PROVIDER ERROR] Request failed for model: '{model}'")
                print(f"Error Type: {type(e).__name__}")
                print(f"Error Details: {e}")
                print(traceback.format_exc())
                print("=" * 60 + "\n")

        # Fallback simulation response if key is missing or API call fails
        await asyncio.sleep(0.15)
        user_msg = messages[-1]["content"] if messages else ""
        content = f"[Groq ({model}) Speed Response] Processed prompt in ultra-low latency: '{user_msg}'"
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

        if self.is_configured():
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(
                    api_key=self.api_key,
                    base_url="https://api.groq.com/openai/v1"
                )

                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "stream": True
                }
                if max_tokens is not None:
                    kwargs["max_tokens"] = max_tokens

                stream = await client.chat.completions.create(**kwargs)
                async for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
                return
            except Exception as e:
                print(f"[GROQ STREAM ERROR] Streaming failed for {model}: {e}")

        # Stream fallback
        res = await self.chat(messages, model, temperature, max_tokens)
        words = res.content.split(" ")
        for word in words:
            yield word + " "
            await asyncio.sleep(0.02)
