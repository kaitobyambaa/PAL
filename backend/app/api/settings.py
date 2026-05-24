from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.user_setting import UserSetting
from app.core.auth import get_current_user

router = APIRouter()

class SettingsUpdate(BaseModel):
    ai_style: str
    language_style: str
    theme: str

@router.get("/")
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = str(current_user.id)

    setting = db.query(UserSetting).filter(UserSetting.user_id == user_id).first()

    if not setting:
        setting = UserSetting(user_id=user_id)
        db.add(setting)
        db.commit()
        db.refresh(setting)

    return {
        "ai_style": setting.ai_style,
        "language_style": setting.language_style,
        "theme": setting.theme,
    }

@router.put("/")
def update_settings(
    request: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = str(current_user.id)

    setting = db.query(UserSetting).filter(UserSetting.user_id == user_id).first()

    if not setting:
        setting = UserSetting(user_id=user_id)
        db.add(setting)

    setting.ai_style = request.ai_style
    setting.language_style = request.language_style
    setting.theme = request.theme

    db.commit()
    db.refresh(setting)

    return {
        "ai_style": setting.ai_style,
        "language_style": setting.language_style,
        "theme": setting.theme,
    }