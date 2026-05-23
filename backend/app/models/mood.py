from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base

class MoodHistory(Base):
    __tablename__ = "mood_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="demo-user")
    mood = Column(String)
    source_message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)