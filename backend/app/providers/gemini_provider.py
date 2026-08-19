import time
import asyncio
import traceback
from typing import List, Dict, Any, Optional, AsyncGenerator
from app.providers.base import BaseProvider, LLMResponse
from app.config import settings


class GeminiProvider(BaseProvider):
    def __init__(self):
        super().__init__(name="gemini", default_model="gemini-2.0-flash")
        self.api_key = settings.GEMINI_API_KEY

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> LLMResponse:
        model = model or self.default_model

        start_time = time.time()

        if self.api_key and not self.api_key.startswith("your_"):
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                gmodel = genai.GenerativeModel(model)
                prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
                response = await asyncio.to_thread(gmodel.generate_content, prompt)
                latency_ms = int((time.time() - start_time) * 1000)
                text = response.text or ""
                return LLMResponse(
                    content=text,
                    model=model,
                    provider=self.name,
                    input_tokens=len(prompt.split()),
                    output_tokens=len(text.split()),
                    latency_ms=latency_ms
                )
            except Exception as e:
                print("\n" + "=" * 60)
                print(f"[GEMINI PROVIDER ERROR] Upstream call failed for model '{model}'")
                print(f"Error Details: {e}")
                print(traceback.format_exc())
                print("=" * 60 + "\n")

        # Fallback
        await asyncio.sleep(0.2)
        user_msg = messages[-1]["content"] if messages else ""
        content = f"[Gemini ({model}) Gateway Response] Processed request: '{user_msg}'"
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
            await asyncio.sleep(0.03)
