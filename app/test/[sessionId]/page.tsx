"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface TestSession {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  duration: number;
  startedAt: string;
}

interface CheatingEvent {
  type: "copy" | "paste" | "cut" | "tab_switch" | "window_blur";
  timestamp: string;
}

// Constants
const SNAPSHOT_INTERVAL_MS = 120000; // 2 minutes

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [code, setCode] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownFiveMinWarning = useRef(false);
  const hasShownOneMinWarning = useRef(false);

  const logCheatingEvent = useCallback(
    async (type: CheatingEvent["type"]) => {
      try {
        await fetch("/api/test/cheating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            type,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Failed to log cheating event:", err);
      }
    },
    [sessionId],
  );

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraPermissionGranted(true);
      }
    } catch (err) {
      console.error("Camera permission denied:", err);
      setWarningMessage("Camera access is required for this test");
    }
  }, []);

  const captureSnapshot = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraPermissionGranted)
      return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg", 0.7);

    try {
      await fetch("/api/test/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          image: base64Image,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to upload snapshot:", err);
    }
  }, [sessionId, cameraPermissionGranted]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/test/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit code");
      }

      alert("Code submitted successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, code, isSubmitting, router]);

  useEffect(() => {
    const fetchTestSession = async () => {
      try {
        const response = await fetch(`/api/test/${sessionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch test session");
        }
        const data = await response.json();
        setTestSession(data);
        setCode(data.starterCode || "");

        const startTime = new Date(data.startedAt).getTime();
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        const remaining = Math.max(0, data.duration * 60 - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleSubmit();
        }
      } catch (err) {
        console.error("Error fetching test session:", err);
        setError("Failed to load test session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestSession();
  }, [sessionId, handleSubmit]);

  useEffect(() => {
    requestCameraPermission();
    const videoElement = videoRef.current;

    return () => {
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [requestCameraPermission]);

  useEffect(() => {
    if (!cameraPermissionGranted) return;

    captureSnapshot();
    snapshotIntervalRef.current = setInterval(
      captureSnapshot,
      SNAPSHOT_INTERVAL_MS,
    );

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }
    };
  }, [cameraPermissionGranted, captureSnapshot]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        if (newTime === 300 && !hasShownFiveMinWarning.current) {
          setWarningMessage("⚠️ 5 minutes remaining!");
          hasShownFiveMinWarning.current = true;
          setTimeout(() => setWarningMessage(""), 5000);
        }

        if (newTime === 60 && !hasShownOneMinWarning.current) {
          setWarningMessage("⚠️ 1 minute remaining!");
          hasShownOneMinWarning.current = true;
          setTimeout(() => setWarningMessage(""), 5000);
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
      logCheatingEvent("copy");
      setWarningMessage("⚠️ Copying is disabled during the test");
      setTimeout(() => setWarningMessage(""), 3000);
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent("paste");
      setWarningMessage("⚠️ Pasting is disabled during the test");
      setTimeout(() => setWarningMessage(""), 3000);
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent("cut");
      setWarningMessage("⚠️ Cutting is disabled during the test");
      setTimeout(() => setWarningMessage(""), 3000);
    };

    const handleBlur = () => {
      logCheatingEvent("window_blur");
      setWarningMessage("⚠️ Tab switching detected. This will be reported.");
      setTimeout(() => setWarningMessage(""), 3000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logCheatingEvent("tab_switch");
        setWarningMessage("⚠️ Tab switching detected. This will be reported.");
        setTimeout(() => setWarningMessage(""), 3000);
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [logCheatingEvent]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return "from-red-500 to-rose-500";
    if (timeRemaining <= 300) return "from-amber-500 to-orange-500";
    return "from-indigo-500 to-violet-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-spin-slow" />
          <p className="text-[var(--text-secondary)]">
            Loading test session...
          </p>
        </div>
      </div>
    );
  }

  if (error && !testSession) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="bg-glass rounded-2xl glow-ring p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!testSession) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="bg-glass rounded-2xl glow-ring p-8 text-center">
          <p className="text-[var(--text-secondary)] text-lg">
            Test session not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--bg-primary)] flex flex-col overflow-hidden">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Bar */}
      <header className="bg-glass-light border-b border-[var(--border-color)] px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] line-clamp-1">
                {testSession.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Session
                </span>
                {cameraPermissionGranted && (
                  <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Proctored
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getTimerColor()} text-white font-mono text-lg sm:text-2xl font-bold tracking-wider shadow-lg`}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      {warningMessage && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-amber-400 text-sm font-medium flex-shrink-0 animate-fade-in-up">
          {warningMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Problem Panel */}
        <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border-color)] bg-glass-light flex items-center gap-2 flex-shrink-0">
            <svg
              className="w-4 h-4 text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Problem Description
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="prose prose-invert max-w-none text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
              {testSession.description}
            </div>
          </div>
        </div>

        {/* Code Panel */}
        <div className="lg:w-1/2 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border-color)] bg-glass-light flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Code Editor
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-[#0d0d14] text-emerald-300 font-mono text-sm p-5 resize-none border-none outline-none focus:ring-0 placeholder-[var(--text-muted)] leading-relaxed"
              placeholder="// Write your solution here..."
              spellCheck={false}
            />
          </div>
          <div className="px-4 py-3 border-t border-[var(--border-color)] bg-glass-light flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full btn-primary !py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Submit Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
