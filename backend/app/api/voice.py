from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    return {
        "text": "Chimege STT later",
        "message": "Voice input structure ready"
    }


@router.post("/tts")
async def text_to_speech(payload: dict):
    return {
        "audio_url": None,
        "message": "Chimege TTS later"
    }