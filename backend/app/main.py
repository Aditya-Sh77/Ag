import time
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, chat
from app.providers import PROVIDERS, print_provider_health_summary, get_providers_status


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB init
    await init_db()
    # Print Model Provider Health Report to terminal console on start
    print_provider_health_summary()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Enterprise AI Platform Control Plane & Gateway Core",
    lifespan=lifespan
)

# Global Exception Handler for debugging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("\n" + "❌" * 30)
    print(f"[BACKEND UNHANDLED ERROR] Exception on {request.method} {request.url}")
    print(f"Error Type: {type(exc).__name__}")
    print(f"Details: {str(exc)}")
    print(traceback.format_exc())
    print("❌" * 30 + "\n")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}", "error_type": type(exc).__name__}
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
        "environment": settings.ENVIRONMENT,
        "providers_status": get_providers_status()
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
            print(f"[HEALTH CHECK ERROR] Provider {name} failed: {e}")
            results[name] = {
                "status": "error",
                "error": str(e)
            }
            
    return {
        "timestamp": time.time(),
        "providers": results
    }
