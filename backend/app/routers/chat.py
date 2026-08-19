import json
import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.models.request_log import RequestLog
from app.schemas.chat import ChatRequest, ChatResponse, ConversationResponse, MessageResponse
from app.providers import get_providers_status
from app.routers.auth import get_current_user
from app.services.router_service import select_model_and_provider

router = APIRouter(prefix="/api", tags=["Gateway & Chat"])


@router.get("/providers/status")
async def get_all_providers_status():
    """Returns availability & health status for all LLM providers (GPT, Gemini, Groq, OpenRouter)."""
    return get_providers_status()


@router.post("/chat", response_model=ChatResponse)
async def chat_completion(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    user_msg_content = req.messages[-1].content
    provider, selected_model = select_model_and_provider(
        routing_mode=req.routing_mode,
        requested_model=req.model,
        prompt=user_msg_content
    )

    # Get or create conversation
    conv_id = req.conversation_id
    if not conv_id:
        title = user_msg_content[:30] + "..." if len(user_msg_content) > 30 else user_msg_content
        conv = Conversation(user_id=current_user.id, title=title)
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        conv_id = conv.id
    else:
        result = await db.execute(select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == current_user.id))
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

    # Save User message
    user_msg = Message(
        conversation_id=conv_id,
        role="user",
        content=user_msg_content
    )
    db.add(user_msg)

    # Execute provider chat call
    start_time = time.time()
    formatted_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    llm_res = await provider.chat(
        messages=formatted_messages,
        model=selected_model,
        temperature=req.temperature
    )
    latency_ms = int((time.time() - start_time) * 1000)

    # Estimate cost
    cost = (llm_res.input_tokens * 0.00015 + llm_res.output_tokens * 0.0006) / 1000.0

    # Save Assistant response message
    asst_msg = Message(
        conversation_id=conv_id,
        role="assistant",
        content=llm_res.content,
        model_used=selected_model,
        input_tokens=llm_res.input_tokens,
        output_tokens=llm_res.output_tokens,
        cost=cost,
        latency_ms=latency_ms
    )
    db.add(asst_msg)

    # Save telemetry request log
    log_entry = RequestLog(
        user_id=current_user.id,
        endpoint="/api/chat",
        model_requested=req.model,
        model_used=selected_model,
        routing_mode=req.routing_mode,
        status_code=200,
        latency_ms=latency_ms,
        input_tokens=llm_res.input_tokens,
        output_tokens=llm_res.output_tokens,
        cost=cost,
        cache_hit=False
    )
    db.add(log_entry)

    await db.commit()
    await db.refresh(asst_msg)

    return ChatResponse(
        id=asst_msg.id,
        conversation_id=conv_id,
        role="assistant",
        content=llm_res.content,
        model_used=selected_model,
        provider_used=provider.name,
        routing_mode=req.routing_mode,
        input_tokens=llm_res.input_tokens,
        output_tokens=llm_res.output_tokens,
        cost=cost,
        latency_ms=latency_ms
    )


@router.post("/chat/stream")
async def chat_stream(
    req: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    user_msg_content = req.messages[-1].content
    provider, selected_model = select_model_and_provider(
        routing_mode=req.routing_mode,
        requested_model=req.model,
        prompt=user_msg_content
    )

    formatted_messages = [{"role": m.role, "content": m.content} for m in req.messages]

    async def event_generator():
        async for chunk in provider.stream_chat(
            messages=formatted_messages,
            model=selected_model,
            temperature=req.temperature
        ):
            yield f"data: {json.dumps({'content': chunk, 'model': selected_model})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    convs = result.scalars().all()
    return [
        ConversationResponse(
            id=c.id,
            title=c.title,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat()
        )
        for c in convs
    ]


@router.get("/conversations/{conv_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conv_id, Conversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    return [
        MessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            model_used=m.model_used,
            created_at=m.created_at.isoformat()
        )
        for m in messages
    ]
