"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Sparkles, Loader2, Brain } from "lucide-react";
import { Task } from "@/lib/types";

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

export default function CaptureView({ onTasksParsed }: Props) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Text that existed in the box before the current recording session
  // started (typed manually, or carried over from earlier sub-sessions).
  const baseTextRef = useRef("");
  // Finalized transcript for the CURRENT sub-session only. Rebuilt from
  // scratch on every onresult event (not incrementally appended) — some
  // mobile engines (esp. Android Chrome) re-emit earlier final results
  // with a shifted resultIndex, which caused text to duplicate when we
  // used to append diffs. Rebuilding from index 0 every time is idempotent.
  const sessionFinalRef = useRef("");
  // Tracks whether the user *wants* to still be recording — separate from
  // whether the underlying engine is currently running. Mobile browsers
  // (esp. Android Chrome) silently stop recognition after a few seconds
  // even with continuous=true, so we auto-restart it under the hood until
  // the user explicitly presses stop.
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
      // Rebuild the full final + interim transcript for THIS sub-session
      // from scratch every time, instead of diffing from event.resultIndex.
      // This is what makes it immune to engines that re-emit older final
      // results under a different index.
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      sessionFinalRef.current = final.trim();
      setText((baseTextRef.current + " " + sessionFinalRef.current + " " + interim).trim());
    };

    recognition.onerror = (event: any) => {
      // "no-speech" / "aborted" are benign — the engine just paused because
      // of silence; onend will fire right after and we restart there.
      if (event?.error === "no-speech" || event?.error === "aborted") return;
      // Anything else (mic permission denied, no mic, network) is fatal.
      shouldListenRef.current = false;
      setIsRecording(false);
      setError(
        event?.error === "not-allowed"
          ? "Немає доступу до мікрофона. Дозволь доступ у налаштуваннях браузера."
          : "Диктування зупинилось через помилку мікрофона. Спробуй ще раз."
      );
    };

    recognition.onend = () => {
      // Fold whatever got finalized in this sub-session into the durable
      // base text, then reset — the next sub-session starts its own
      // results array back at index 0.
      if (sessionFinalRef.current) {
        baseTextRef.current = (baseTextRef.current + " " + sessionFinalRef.current).trim();
        sessionFinalRef.current = "";
      }

      if (shouldListenRef.current) {
        // Mobile browsers cut the session after a few seconds of silence —
        // restart immediately so it feels continuous to the user.
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // already running / not ready yet — ignore, next onend will retry
          }
        }, 150);
      } else {
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
      sessionFinalRef.current = "";
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
        setError("AI не знайшов жодної задачі в тексті. Спробуй сформулювати конкретніше.");
        return;
      }

      onTasksParsed(newTasks);
      setText("");
      baseTextRef.current = "";
    } catch (e) {
      setError("Не вдалось звʼязатися з сервером. Перевір інтернет і спробуй ще раз.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-4 pt-6">
      <div className="mb-4 flex items-center gap-2 text-accent2">
        <Brain size={20} />
        <h1 className="text-lg font-semibold text-white">Що в голові?</h1>
      </div>
      <p className="mb-4 text-sm text-muted">
        Вивали текстом або голосом усе, що треба зробити — AI сам розбере це на задачі з
        пріоритетом, часом і дедлайном.
      </p>

      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напр.: треба здати звіт до пʼятниці, подзвонити клієнту завтра вранці, купити подарунок на день народження, розібрати пошту..."
          className="h-56 w-full resize-none rounded-2xl border border-border bg-surface p-4 text-[15px] leading-relaxed text-white outline-none placeholder:text-muted focus:border-accent"
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
        <p className="mt-2 text-center text-xs text-high">🔴 Слухаю... натисни ще раз, щоб зупинити</p>
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
            Розбираю...
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
