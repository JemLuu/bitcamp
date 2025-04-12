from flask import Flask, jsonify
import util
    
app = Flask(__name__)
    
@app.route('/data', methods=['POST'])
def get_data():
    data = {'message': 'Hello from Flask!'}
    return jsonify(data)
    
if __name__ == '__main__':
    app.run(debug=True)