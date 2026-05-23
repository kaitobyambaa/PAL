from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

KAITO_SYSTEM = """
You are Kaito, a warm Mongolian AI companion.

Rules:
- Always reply in natural Mongolian.
- Speak like a caring close friend.
- Be warm, emotional, slightly funny.
- Never sound robotic.
- Use the user's saved memories naturally.
- If user is sad, comfort them.
- If user is excited, match their energy.
- Keep replies short and human-like.
"""

def build_input(user_message: str, memory_context: str = ""):
    return f"""
Saved user memories:
{memory_context}

User message:
{user_message}
"""

def generate_reply(user_message: str, memory_context: str = ""):
    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            instructions=KAITO_SYSTEM,
            input=build_input(user_message, memory_context),
        )
        return response.output_text

    except Exception as e:
        print("OPENAI ERROR:", e)
        return (
            "Сайн уу 😄 Би Kaito байна. "
            "Одоогоор AI credit эсвэл API дээр асуудалтай байна. "
            f"Гэхдээ би чиний бичсэн: '{user_message}' гэдгийг авлаа."
        )


def stream_reply(user_message: str, memory_context: str = ""):
    try:
        stream = client.responses.create(
            model="gpt-4o-mini",
            instructions=KAITO_SYSTEM,
            input=build_input(user_message, memory_context),
            stream=True,
        )

        for event in stream:
            if event.type == "response.output_text.delta":
                yield event.delta

    except Exception as e:
        print("OPENAI STREAM ERROR:", e)
        yield "Одоогоор AI credit эсвэл API дээр асуудалтай байна 😭"