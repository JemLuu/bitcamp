import React, { useEffect, useRef, useState } from 'react';
import { Camera, Play, Pause, RefreshCw, Eye } from 'lucide-react';

function App() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const describeButtonRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Speech synthesis setup
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Initialize camera
  const initializeCamera = async () => {
    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: { exact: 'environment' }, // 👈 prefer rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
  
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        playSound("/camera_on.mp3");
      }
    } catch (err) {
      console.warn("Rear camera not available or denied. Falling back to any available video stream.");
  
      try {
        const fallbackConstraints = {
          video: {
            facingMode: 'environment', // 👈 looser fallback
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };
  
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
  
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          playSound("/camera_on.mp3");
        }
      } catch (fallbackError) {
        console.error("Camera fallback also failed:", fallbackError);
        setError('Failed to access camera. Please ensure camera permissions are granted.');
        speak('Camera access denied. Please check your permissions.');
      }
    }
  };

  // Capture photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setError('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas with horizontal flip
    context.scale(-1, 1); // Flip horizontally
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.scale(-1, 1); // Reset transform

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg')
      );

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');
      playSound("/440.mp3");
      setStatus('Sending photo for description...');

      const NGROK_URL = import.meta.env.VITE_NGROK_URL;
      // Send to backend
      const response = await fetch(`${NGROK_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to get description'); 

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setStatus('Description received');
      }
    } catch (err) {
      setError('Failed to get description. Please try again.');
      playSound("/err_desc.mp3");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle automatic capture
  const toggleCapture = () => {
    setIsCapturing(prev => !prev);
    if (isCapturing) {
      playSound("/auto_stop.mp3");
    } else {
      playSound("/auto_started.mp3");
    }
  };

  const playSound = (path: string) => {
    const audio = new Audio(path);
    audio.play();
  };

  // Focus first interactive element on load
  useEffect(() => {
    describeButtonRef.current?.focus();
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
  
    if (isCapturing) {
      // 👇 Capture once immediately
      capturePhoto();
  
      // 👇 Then every 15 seconds
      interval = setInterval(capturePhoto, 15000);
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCapturing]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <main id="main" className="container">
        <div className="logo" role="banner">
          <Eye aria-hidden="true" />
          <span>EchoLens</span>
        </div>
        
        <div role="status" aria-live="polite">
          {status && <p className="status success">{status}</p>}
          {error && <p className="status error">{error}</p>}
        </div>

        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-preview"
            aria-hidden="true"
          />
          <canvas
            ref={canvasRef}
            className="sr-only"
            aria-hidden="true"
          />
          <audio
            ref={audioRef}
            controls
            className="sr-only"
            aria-label="Description audio"
          />
        </div>

        <div className="button-container">
          <button
            ref={describeButtonRef}
            className="button"
            onClick={capturePhoto}
            disabled={isLoading}
            aria-label="Describe current view"
          >
            {isLoading ? (
              <RefreshCw className="loading" aria-hidden="true" />
            ) : (
              <Camera aria-hidden="true" />
            )}
          </button>

          <button
            className="button"
            onClick={toggleCapture}
            disabled={isLoading}
            aria-label={isCapturing ? 'Stop automatic capture' : 'Start automatic capture'}
          >
            {isCapturing ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="sr-only" aria-live="polite">
          {isCapturing && 'Automatic capture is active. Photos will be taken every 15 seconds.'}
          {isLoading && 'Processing image, please wait...'}
        </div>
      </main>
    </>
  );
}

export default App;