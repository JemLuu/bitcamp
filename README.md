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
* Terminal 3 (npm install -g localtunnel)
    * Run: npx localtunnel --port 5173 --subdomain echolens1234
        * This will give a tunnel for the frontend
        * It will give you a URL. This is the URL you go on to your phone
        * The IP Password is at https://loca.lt/mytunnelpassword on your computer
* Terminal 4 (need ngrok downloaded):
    * ngrok http 5000 
        * This is the HTTPS tunnel for the backend! 
    * Create a .env file in the /frontend/EchoLens folder
    * Add this to the .env: VITE_NGROK_URL=https://whatever_you_get.ngrok-free.app

After all this, you should be good to go.
