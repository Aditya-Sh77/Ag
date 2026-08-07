from pydantic import BaseModel
from typing import List, Optional, Dict


class ChatMessageSchema(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessageSchema]
    model: str = "gpt-4o-mini"
    routing_mode: str = "manual"  # "manual" | "auto" | "cost" | "fastest" | "balanced"
    conversation_id: Optional[str] = None
    temperature: float = 0.7


class ChatResponse(BaseModel):
    id: str
    conversation_id: str
    role: str = "assistant"
    content: str
    model_used: str
    provider_used: str
    routing_mode: str
    input_tokens: int
    output_tokens: int
    cost: float
    latency_ms: int


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    model_used: Optional[str]
    created_at: str
