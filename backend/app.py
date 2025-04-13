from flask import Flask, request, send_file, jsonify, after_this_request
import os
import uuid
from util import process_image, tts
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# make folder
UPLOAD_FOLDER = 'temp_uploads'
AUDIO_FOLDER = 'temp_audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# test endpoint
@app.route('/data', methods=['GET'])
def get_data():
    data = {'message': 'Hello from Flask!'}
    return jsonify(data)

'''
@app.route('/test', methods=['GET'])
def test_data():
    return None
'''

# upload endpoint
@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files['image']
    image_id = str(uuid.uuid4())
    image_path = os.path.join(UPLOAD_FOLDER, f"{image_id}.jpg")
    audio_path = os.path.join(AUDIO_FOLDER, f"{image_id}.mp3")

    try:
        image_file.save(image_path)

        description = process_image(image_path)
        tts(description, audio_path)

        # @after_this_request
        # def remove_file(response):
        #     try:
        #         os.remove(audio_path)
        #     except Exception as cleanup_error:
        #         print("Cleanup error:", cleanup_error)
        #     return response
        
        return send_file(audio_path, mimetype='audio/mpeg')


    except Exception as e:
        print("Error in upload-image:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

if __name__ == '__main__':
    app.run(debug=True)