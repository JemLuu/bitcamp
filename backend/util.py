import base64
import os, uuid
from pathlib import Path
from openai import OpenAI

client = OpenAI()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

# send image to ChatGPT and return descriptor text
def process_image(image_path):
    # image_path = "../ducks.jpeg"

    base64_image = encode_image(image_path)

    response = client.responses.create(
        model="gpt-4o",
        input=[
            {
                "role": "user",
                "content": [
                    { "type": "input_text", "text": "how would you describe what you are seeing to a blind person? limit your response to two sentences. start with 'there is...' " },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                ],
            }
        ],
    )
    return response.output_text

# send descriptor text to TTS api
def tts(description, audio_path):
    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="onyx",
        input=description,
        instructions="Speak in a cheerful and positive tone.",
    ) as response:
        response.stream_to_file(audio_path)
    return None

'''
UPLOAD_FOLDER = 'temp_uploads'
AUDIO_FOLDER = 'temp_audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
image_id = str(uuid.uuid4())
image_path = os.path.join(UPLOAD_FOLDER, f"{image_id}.jpg")
audio_path = os.path.join(AUDIO_FOLDER, f"{image_id}.mp3")
# print(process_image("../ducks.jpeg"))
tts(process_image("../ducks.jpeg"), audio_path)
'''