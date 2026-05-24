from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base

class UserSetting(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    ai_style = Column(String, default="calm")
    language_style = Column(String, default="natural")
    theme = Column(String, default="dark")
    created_at = Column(DateTime, default=datetime.utcnow)