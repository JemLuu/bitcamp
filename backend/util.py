import base64
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
    response.output_text

# send descriptor text to TTS api
def tts(audio_path):
    # TODO: 
    return None

# process_image("../ducks.jpeg")