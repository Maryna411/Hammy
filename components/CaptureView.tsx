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
  // Latest known transcript for the CURRENT sub-session only.
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
      // Some mobile engines (observed on Android) don't emit incremental
      // deltas — each new entry in event.results re-transcribes the WHOLE
      // sub-session from the start, growing longer each time. Summing all
      // entries duplicated every earlier word. The fix: only ever trust
      // the LAST entry — it already is the full up-to-date transcript of
      // everything said in this sub-session so far.
      const last = event.results[event.results.length - 1];
      if (!last) return;
      sessionFinalRef.current = last[0].transcript.trim();
      setText((baseTextRef.current + " " + sessionFinalRef.current).trim());
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
          : "Диктування зупинилось через помилку
