from sqlalchemy.orm import Session
from app.models.mood import MoodHistory

def detect_mood(message: str):
    text = message.lower()

    sad_words = [
        "гунигтай", "ганцаардаж", "хэцүү", "уйламаар",
        "ядарлаа", "сэтгэлээр", "sad", "tired", "lonely"
    ]

    happy_words = [
        "гоё", "баяртай", "жаргалтай", "хөөрхөн",
        "сайхан", "happy", "nice", "love"
    ]

    angry_words = [
        "уур", "ууртай", "дургүй", "залхаж",
        "fuck", "sda", "уцаар"
    ]

    stress_words = [
        "стресс", "айж", "сандарч", "дарамт",
        "шалгалт", "ажил их", "stress", "anxious"
    ]

    if any(word in text for word in sad_words):
        return "sad"

    if any(word in text for word in angry_words):
        return "angry"

    if any(word in text for word in stress_words):
        return "stressed"

    if any(word in text for word in happy_words):
        return "happy"

    return "neutral"


def save_mood(db: Session, user_id: str, message: str):
    mood = detect_mood(message)

    mood_record = MoodHistory(
        user_id=user_id,
        mood=mood,
        source_message=message
    )

    db.add(mood_record)
    db.commit()
    db.refresh(mood_record)

    return mood_record


def get_latest_mood(db: Session, user_id: str):
    return (
        db.query(MoodHistory)
        .filter(MoodHistory.user_id == user_id)
        .order_by(MoodHistory.created_at.desc())
        .first()
    )