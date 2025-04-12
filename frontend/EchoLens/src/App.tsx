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
        video: {
          facingMode: 'user', // Changed to front-facing camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        speak('Camera initialized. Ready to capture images.');
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      speak('Camera access denied. Please check your permissions.');
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

      speak('Photo captured. Sending for description.');
      setStatus('Sending photo for description...');

      // Send to backend
      const response = await fetch('/api/describe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to get description');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        speak('Description received. Playing audio.');
        setStatus('Description received');
      }
    } catch (err) {
      setError('Failed to get description. Please try again.');
      speak('Error getting description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle automatic capture
  const toggleCapture = () => {
    setIsCapturing(prev => !prev);
    speak(isCapturing ? 'Automatic capture stopped' : 'Automatic capture started');
  };

  // Focus first interactive element on load
  useEffect(() => {
    describeButtonRef.current?.focus();
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
  }, []);

  // Handle automatic capture
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCapturing) {
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
          <span>SeeForMe</span>
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