from pathlib import Path
from openai import OpenAI

client = OpenAI()
speech_file_path = Path(__file__).parent / "speech.mp3"

with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="onyx",
    input="There is a group of four white ducks standing closely together in a sunlit grassy area. Each duck has bright orange beaks and soft, fluffy feathers, exuding a serene and peaceful vibe as they interact calmly with each other.",
    instructions="Speak in a cheerful and positive tone.",
) as response:
    response.stream_to_file(speech_file_path)