"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Sparkles, Loader2 } from "lucide-react";
import { Task } from "@/lib/types";
import { HAMMY } from "@/lib/hammy";
import Hammy from "./Hammy";

interface Props {
  onTasksParsed: (tasks: Task[]) => void;
}

// Minimal typing shim for the Web Speech API (not in default TS lib)
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/**
 * Merges a new speech-recognition snapshot into the running transcript.
 * Some mobile engines re-emit the whole phrase-so-far on every result
 * (sometimes re-including a bit of what's already been captured, e.g. on
 * an internal restart), so naively concatenating snapshots duplicates
 * words. This merge only appends whatever is genuinely NEW at the end of
 * `next` relative to `prev`, using the longest prev-suffix / next-prefix
 * overlap it can find.
 */
function mergeSnapshot(prev: string, next: string): string {
  if (!prev) return next;
  if (!next) return prev;
  const prevLower = prev.toLowerCase();
  const nextLower = next.toLowerCase();

  if (nextLower.startsWith(prevLower)) return next; // next = prev + more
  if (prevLower.startsWith(nextLower)) return prev; // next is a rewound/shorter echo — ignore

  const maxOverlap = Math.min(prev.length, next.length);
  for (let len = maxOverlap; len > 0; len--) {
    if (prevLower.slice(prevLower.length - len) === nextLower.slice(0, len)) {
      return (prev + next.slice(len)).trim();
    }
  }
  return (prev + " " + next).trim(); // no overlap — genuinely new phrase
}

export default function CaptureView({ onTasksParsed }: Props) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef("");
  const liveRef = useRef("");
  const shouldListenRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    setSpeechSupported(true);

    const recognition: SpeechRecognitionLike = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (!last) return;
      const snapshot = last[0].transcript.trim();
      liveRef.current = mergeSnapshot(liveRef.current, snapshot);
      setText((baseTextRef.current + " " + liveRef.current).trim());
    };

    recognition.onerror = (event: any) => {
      if (event?.error === "no-speech" || event?.error === "aborted") return;
      shouldListenRef.current = false;
      setIsRecording(false);
      setError(
        event?.error === "not-allowed"
          ? "Немає доступу до мікрофона. Дозволь доступ у налаштуваннях браузера."
          : "Диктування зупинилось через помилку мікрофона. Спробуй ще раз."
      );
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // already running / not ready yet — ignore, next onend will retry
          }
        }, 150);
      } else {
        baseTextRef.current = (baseTextRef.current + " " + liveRef.current).trim();
        liveRef.current = "";
        setText(baseTextRef.current);
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      shouldListenRef.current = false;
      try {
        recognition.stop();
      } catch {
        // no-op
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      shouldListenRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      baseTextRef.current = text;
      liveRef.current = "";
      shouldListenRef.current = true;
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleParse = async () => {
    if (!text.trim() || isParsing) return;
    setIsParsing(true);
    setError(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Щось пішло не так.");
        return;
      }
      const now = new Date().toISOString();
      const newTasks: Task[] = (data.tasks || []).map((t: any) => ({
        id: crypto.randomUUID(),
        title: t.title,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        deadline: t.deadline,
        completed: false,
        scheduledForToday: false,
        createdAt: now,
        postponedCount: 0,
      }));

      if (newTasks.length === 0) {
        setError(HAMMY.parseEmptyError);
        return;
      }

      onTasksParsed(newTasks);
      setText("");
      baseTextRef.current = "";
    } catch (e) {
      setError(HAMMY.networkError);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-4 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Hammy mood={isRecording ? "listening" : isParsing ? "thinking" : "idle"} size={28} />
        <h1 className="text-lg font-semibold text-ink">{HAMMY.captureTitle}</h1>
      </div>
      <p className="mb-4 text-sm text-muted">{HAMMY.captureSubtitle}</p>

      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напр.: треба здати звіт до пʼятниці, подзвонити клієнту завтра вранці, купити подарунок на день народження, розібрати пошту..."
          className="h-56 w-full resize-none rounded-2xl border border-border bg-surface p-4 text-[15px] leading-relaxed text-ink outline-none placeholder:text-muted focus:border-accent"
        />
        {speechSupported && (
          <button
            onClick={toggleRecording}
            aria-label={isRecording ? "Зупинити диктування" : "Диктувати"}
            className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              isRecording ? "recording bg-high text-white" : "bg-accent text-white"
            }`}
          >
            {isRecording ? <Square size={16} /> : <Mic size={18} />}
          </button>
        )}
      </div>

      {isRecording && (
        <p className="mt-2 text-center text-xs text-high">🔴 {HAMMY.listening}</p>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-high/10 px-3 py-2 text-sm text-high">{error}</p>
      )}

      <button
        onClick={handleParse}
        disabled={!text.trim() || isParsing}
        className="mt-4 mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[15px] font-medium text-white transition-opacity disabled:opacity-40"
      >
        {isParsing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {HAMMY.thinking}
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Розібрати на задачі
          </>
        )}
      </button>
    </div>
  );
}
