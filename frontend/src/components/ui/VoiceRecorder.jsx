import { useState, useRef, useEffect } from 'react';

export default function VoiceRecorder({ onRecordingComplete }) {
  const [state, setState] = useState('idle'); // idle, recording, paused, done
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        onRecordingComplete(blob, duration);
        stream.getTracks().forEach(t => t.stop());
      };

      mr.start(100);
      setState('recording');
      startTimer();
    } catch (err) {
      alert('Microphone access denied. Please enable it in browser settings.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      stopTimer();
      setState('done');
    }
  };

  const resetRecording = () => {
    setState('idle');
    setDuration(0);
    setAudioUrl(null);
    setAudioBlob(null);
    chunksRef.current = [];
    onRecordingComplete(null, 0);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Waveform visual */}
      <div className="h-16 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center gap-1 overflow-hidden px-4">
        {state === 'recording' ? (
          Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-ink-600 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 40}ms`,
                animationDuration: `${600 + Math.random() * 400}ms`
              }}
            />
          ))
        ) : state === 'done' && audioUrl ? (
          <audio controls src={audioUrl} className="w-full" />
        ) : (
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="1.75" />
              <path d="M5 10V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-mono">
              {state === 'paused' ? 'Paused' : 'Tap record to begin'}
            </span>
          </div>
        )}
      </div>

      {/* Timer */}
      {(state === 'recording' || state === 'paused' || state === 'done') && (
        <div className="text-center">
          <span className="text-2xl font-mono text-ink-700">{formatTime(duration)}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {state === 'idle' && (
          <button onClick={startRecording} className="btn-primary flex items-center gap-2 w-full justify-center">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Start Recording
          </button>
        )}

        {state === 'recording' && (
          <>
            <button onClick={pauseRecording} className="btn-secondary flex-1">Pause</button>
            <button onClick={stopRecording} className="btn-primary flex-1">Stop</button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button onClick={resumeRecording} className="btn-secondary flex-1">Resume</button>
            <button onClick={stopRecording} className="btn-primary flex-1">Stop</button>
          </>
        )}

        {state === 'done' && (
          <button onClick={resetRecording} className="btn-ghost text-sm">
            Re-record
          </button>
        )}
      </div>
    </div>
  );
}
