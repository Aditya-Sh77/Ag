from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

from app.config import settings
from app.database import init_db
from app.routers import auth, chat
from app.providers import PROVIDERS


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB init
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Enterprise AI Platform Control Plane & Gateway Core",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(chat.router)


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health/providers")
async def check_provider_health():
    """Diagnostic endpoint to verify all registered AI Provider APIs."""
    results = {}
    test_messages = [{"role": "user", "content": "Ping test"}]
    
    for name, provider in PROVIDERS.items():
        try:
            res = await provider.chat(messages=test_messages)
            results[name] = {
                "status": "online",
                "model": res.model,
                "latency_ms": res.latency_ms,
                "input_tokens": res.input_tokens,
                "output_tokens": res.output_tokens,
                "sample_response": res.content[:100]
            }
        except Exception as e:
            results[name] = {
                "status": "error",
                "error": str(e)
            }
            
    return {
        "timestamp": time.time(),
        "providers": results
    }
