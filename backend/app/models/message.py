from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.db.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="demo-user")
    role = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)