# EchoLens
Built by Rachel Jan, Ryder Pham, Delaney Schiedell, and Jeremy Luu

# Description
Web app for mobile use to narrate camera feed

# Usage (MacOS Specific)
* Terminal 1 (backend):
    * cd backend
    * python3 -m venv venv
    * source venv/bin/activate
    * pip install -r requirements.txt
    * python3 app.py
* Terminal 2 (frontend):
    * cd frontend/EchoLens
    * npm install
        * might have to npm audit
    * npm run dev
* Terminal 3 (need ngrok downloaded):
    * ngrok http 5173 
        * Make sure 5173 is the correct point as your frontend (should be)
    * https://__________.ngrok-free.app/upload-image is the website