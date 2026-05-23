from sqlalchemy.orm import Session
from app.models.memory import Memory

def extract_memory_from_message(message: str):
    text = message.lower()

    if "нэр" in text and ("миний" in text or "namaig" in text or "намайг" in text):
        return ("name", message)

    if "дуртай" in text:
        return ("likes", message)

    if "дургүй" in text:
        return ("dislikes", message)

    if "сануулаарай" in text or "remind" in text:
        return ("reminder_request", message)

    if "гунигтай" in text or "ядарлаа" in text or "хэцүү" in text:
        return ("mood", "sad_or_tired")

    return None


def save_memory_if_needed(db: Session, user_id: str, message: str):
    extracted = extract_memory_from_message(message)

    if not extracted:
        return None

    key, value = extracted

    memory = Memory(
        user_id=user_id,
        key=key,
        value=value,
        importance=2
    )

    db.add(memory)
    db.commit()
    db.refresh(memory)

    return memory


def get_user_memories(db: Session, user_id: str):
    memories = (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.created_at.desc())
        .limit(10)
        .all()
    )

    return memories


def build_memory_context(memories):
    if not memories:
        return "No saved memories yet."

    lines = []

    for memory in memories:
        lines.append(f"- {memory.key}: {memory.value}")

    return "\n".join(lines)