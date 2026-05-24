from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.memory import Memory

from app.core.auth import get_current_user
from app.services.ai_service import generate_reply, stream_reply
from app.services.memory_service import (
    save_memory_if_needed,
    get_user_memories,
    build_memory_context,
)
from app.services.emotion_service import save_mood, get_latest_mood

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class MemoryUpdate(BaseModel):
    key: str
    value: str
    importance: int = 2


@router.post("/")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        user_id = str(current_user.id)

        db.add(
            Message(
                user_id=user_id,
                role="user",
                content=request.message,
            )
        )
        db.commit()

        save_memory_if_needed(db, user_id, request.message)
        mood_record = save_mood(db, user_id, request.message)

        memories = get_user_memories(db, user_id)
        memory_context = build_memory_context(memories)

        reply = generate_reply(
            user_message=request.message,
            memory_context=f"""
{memory_context}

Latest detected mood: {mood_record.mood}
""",
        )

        db.add(
            Message(
                user_id=user_id,
                role="assistant",
                content=reply,
            )
        )
        db.commit()

        return {
            "reply": reply,
            "mood": mood_record.mood,
        }

    except Exception as e:
        print("CHAT ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        user_id = str(current_user.id)

        db.add(
            Message(
                user_id=user_id,
                role="user",
                content=request.message,
            )
        )
        db.commit()

        save_memory_if_needed(db, user_id, request.message)
        mood_record = save_mood(db, user_id, request.message)

        memories = get_user_memories(db, user_id)
        memory_context = build_memory_context(memories)

        final_text = ""

        def generator():
            nonlocal final_text

            try:
                for chunk in stream_reply(
                    user_message=request.message,
                    memory_context=f"""
{memory_context}

Latest detected mood: {mood_record.mood}
""",
                ):
                    final_text += chunk
                    yield chunk

                db.add(
                    Message(
                        user_id=user_id,
                        role="assistant",
                        content=final_text,
                    )
                )
                db.commit()

            except Exception as e:
                print("STREAM GENERATOR ERROR:", e)
                yield "Уучлаарай 😭 Одоогоор хариу үүсгэхэд алдаа гарлаа."

        return StreamingResponse(generator(), media_type="text/plain")

    except Exception as e:
        print("STREAM ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)

    messages = (
        db.query(Message)
        .filter(Message.user_id == user_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [
        {
            "role": msg.role,
            "content": msg.content,
            "created_at": str(msg.created_at),
        }
        for msg in messages
    ]


@router.get("/memories")
def get_memories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)

    memories = (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.created_at.desc())
        .all()
    )

    return [
        {
            "id": memory.id,
            "key": memory.key,
            "value": memory.value,
            "importance": memory.importance,
            "created_at": str(memory.created_at),
        }
        for memory in memories
    ]


@router.put("/memories/{memory_id}")
def update_memory(
    memory_id: int,
    request: MemoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)

    memory = (
        db.query(Memory)
        .filter(Memory.id == memory_id, Memory.user_id == user_id)
        .first()
    )

    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    memory.key = request.key
    memory.value = request.value
    memory.importance = request.importance

    db.commit()
    db.refresh(memory)

    return {
        "id": memory.id,
        "key": memory.key,
        "value": memory.value,
        "importance": memory.importance,
        "created_at": str(memory.created_at),
    }


@router.delete("/memories/{memory_id}")
def delete_memory(
    memory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)

    memory = (
        db.query(Memory)
        .filter(Memory.id == memory_id, Memory.user_id == user_id)
        .first()
    )

    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    db.delete(memory)
    db.commit()

    return {"message": "Memory deleted"}


@router.get("/mood")
def get_mood(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)

    latest = get_latest_mood(db, user_id)

    if not latest:
        return {
            "mood": "neutral",
            "source_message": "",
            "created_at": "",
        }

    return {
        "mood": latest.mood,
        "source_message": latest.source_message,
        "created_at": str(latest.created_at),
    }