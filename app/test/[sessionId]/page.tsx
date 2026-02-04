'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TestSession {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  duration: number;
  startedAt: string;
}

interface CheatingEvent {
  type: 'copy' | 'paste' | 'cut' | 'tab_switch' | 'window_blur';
  timestamp: string;
}

// Constants
const SNAPSHOT_INTERVAL_MS = 120000; // 2 minutes

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [code, setCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownFiveMinWarning = useRef(false);
  const hasShownOneMinWarning = useRef(false);

  const logCheatingEvent = useCallback(async (type: CheatingEvent['type']) => {
    try {
      await fetch('/api/test/cheating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to log cheating event:', err);
    }
  }, [sessionId]);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraPermissionGranted(true);
      }
    } catch (err) {
      console.error('Camera permission denied:', err);
      setWarningMessage('Camera access is required for this test');
    }
  }, []);

  const captureSnapshot = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraPermissionGranted) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.7);

    try {
      await fetch('/api/test/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          image: base64Image,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to upload snapshot:', err);
    }
  }, [sessionId, cameraPermissionGranted]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/test/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit code');
      }

      alert('Code submitted successfully!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, code, isSubmitting, router]);

  useEffect(() => {
    const fetchTestSession = async () => {
      try {
        const response = await fetch(`/api/test/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch test session');
        }
        const data = await response.json();
        setTestSession(data);
        setCode(data.starterCode || '');

        const startTime = new Date(data.startedAt).getTime();
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        const remaining = Math.max(0, data.duration * 60 - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleSubmit();
        }
      } catch (err) {
        console.error('Error fetching test session:', err);
        setError('Failed to load test session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestSession();
  }, [sessionId, handleSubmit]);

  useEffect(() => {
    requestCameraPermission();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [requestCameraPermission]);

  useEffect(() => {
    if (!cameraPermissionGranted) return;

    captureSnapshot();
    snapshotIntervalRef.current = setInterval(captureSnapshot, SNAPSHOT_INTERVAL_MS);

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }
    };
  }, [cameraPermissionGranted, captureSnapshot]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;

        if (newTime === 300 && !hasShownFiveMinWarning.current) {
          setWarningMessage('⚠️ 5 minutes remaining!');
          hasShownFiveMinWarning.current = true;
          setTimeout(() => setWarningMessage(''), 5000);
        }

        if (newTime === 60 && !hasShownOneMinWarning.current) {
          setWarningMessage('⚠️ 1 minute remaining!');
          hasShownOneMinWarning.current = true;
          setTimeout(() => setWarningMessage(''), 5000);
        }

        if (newTime <= 0) {
          handleSubmit();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timeRemaining, handleSubmit]);

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent('copy');
      setWarningMessage('⚠️ Copying is disabled during the test');
      setTimeout(() => setWarningMessage(''), 3000);
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent('paste');
      setWarningMessage('⚠️ Pasting is disabled during the test');
      setTimeout(() => setWarningMessage(''), 3000);
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent('cut');
      setWarningMessage('⚠️ Cutting is disabled during the test');
      setTimeout(() => setWarningMessage(''), 3000);
    };

    const handleBlur = () => {
      logCheatingEvent('window_blur');
      setWarningMessage('⚠️ Tab switching detected. This will be reported.');
      setTimeout(() => setWarningMessage(''), 3000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logCheatingEvent('tab_switch');
        setWarningMessage('⚠️ Tab switching detected. This will be reported.');
        setTimeout(() => setWarningMessage(''), 3000);
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logCheatingEvent]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading test session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!testSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Test session not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{testSession.title}</h1>
          <div className={`text-3xl font-mono font-bold ${timeRemaining <= 300 ? 'text-red-600' : 'text-blue-600'}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </header>

      {warningMessage && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-center font-semibold">
          {warningMessage}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        <div className="lg:w-1/2 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Problem Description</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {testSession.description}
          </div>
        </div>

        <div className="lg:w-1/2 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Code Editor</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 font-mono text-sm p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your code here..."
            spellCheck={false}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
