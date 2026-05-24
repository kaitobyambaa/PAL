from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.auth import router as auth_router
from app.api.voice import router as voice_router
from app.api.settings import router as settings_router

from app.db.database import Base, engine

from app.models.user import User
from app.models.message import Message
from app.models.memory import Memory
from app.models.mood import MoodHistory
from app.models.user_setting import UserSetting

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Suuder AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://pal-byambaa-s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(chat_router, prefix="/api/chat")
app.include_router(voice_router, prefix="/api/voice")
app.include_router(settings_router, prefix="/api/settings")

@app.get("/")
def root():
    return {"message": "Suuder backend is running"}