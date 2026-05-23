from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.db.database import Base

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="demo-user")
    key = Column(String, index=True)
    value = Column(Text)
    importance = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)