import base64
import os, uuid
from pathlib import Path
from openai import OpenAI

client = OpenAI()
context = ""

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
                    { "type": "input_text", "text": generate_text() },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                ],
            }
        ],
    )

    context += response.output_text
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

def generate_text():
    return f"""You are a helpful assistant describing important visual details (included in photo) to a visually impaired user. 
    Speak directly to the listener, like a live narrator. 
    Only describe what has changed, moved, or become relevant since the last frame — avoid repeating what’s already been described.  
    Be concise: just a few natural phrases or a short sentence.  
    You’ve already said:  
    \"{context}\"  
    Now, continue the narration with what’s happening right now in the latest frame.  
    Don’t use words like "image", "photo", or "picture". If only one person is present, you don’t need to identify them each time.
    """

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