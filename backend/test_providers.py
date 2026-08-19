import asyncio
import time
import json
from app.config import settings
from app.providers import PROVIDERS


async def test_all_providers():
    print("=" * 70)
    print("      ENTERPRISE AI PLATFORM - PROVIDER DIAGNOSTIC & DEBUG TOOL      ")
    print("=" * 70)
    print(f"Project: {settings.PROJECT_NAME}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print("-" * 70)

    test_prompt = [{"role": "user", "content": "Reply with a 1-sentence greeting and name your model."}]

    for provider_name, provider in PROVIDERS.items():
        print(f"\n[Testing Provider: {provider_name.upper()}]")
        print(f"Default Model: {provider.default_model}")
        
        # Check API Key status
        key_val = getattr(settings, f"{provider_name.upper()}_API_KEY", None)
        if provider_name == "ollama":
            print(f"Base URL: {settings.OLLAMA_BASE_URL}")
        else:
            masked_key = f"{key_val[:8]}...{key_val[-4:]}" if key_val and len(key_val) > 12 else ("SET" if key_val else "NOT SET")
            print(f"API Key Status: {masked_key}")

        start = time.time()
        try:
            res = await provider.chat(messages=test_prompt)
            duration = int((time.time() - start) * 1000)
            
            print(f"Status: SUCCESS (200 OK)")
            print(f"Latency: {res.latency_ms} ms (Total turn: {duration} ms)")
            print(f"Model Used: {res.model}")
            print(f"Tokens Used: Input={res.input_tokens}, Output={res.output_tokens}")
            print(f"Response Preview: {res.content.strip()[:150]}")
        except Exception as e:
            print(f"Status: ERROR")
            print(f"Error Details: {str(e)}")

    print("\n" + "=" * 70)
    print("Diagnostic Complete!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(test_all_providers())
