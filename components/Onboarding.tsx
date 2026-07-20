"use client";

import { useState } from "react";
import { Mic, Inbox as InboxIcon, ListChecks } from "lucide-react";
import Hammy, { HammyMood } from "./Hammy";
import { HAMMY } from "@/lib/hammy";

type TabKey = "capture" | "inbox" | "today";

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
  { key: "capture", label: "Записати", icon: <Mic size={18} /> },
  { key: "inbox", label: "Задачі", icon: <InboxIcon size={18} /> },
  { key: "today", label: "Сьогодні", icon: <ListChecks size={18} /> },
];

const SLIDES: { title: string; text: string; mood: HammyMood; tab: TabKey | null }[] = [
  {
    title: HAMMY.onboardingWelcomeTitle,
    text: HAMMY.onboardingWelcomeText,
    mood: "happy",
    tab: null,
  },
  {
    title: "Записати",
    text: "Запиши мені все, що в голові — текстом чи голосом. Я розберу цей безлад.",
    mood: "listening",
    tab: "capture",
  },
  {
    title: "Задачі",
    text: "Тут я складаю розібрані задачі — з пріоритетом, часом і дедлайном. Можеш поправити що завгодно.",
    mood: "thinking",
    tab: "inbox",
  },
  {
    title: "Сьогодні",
    text: "А тут — план на сьогодні. Що встигнеш, відмічай, решту я сам перенесу на завтра.",
    mood: "happy",
    tab: "today",
  },
];

interface Props {
  onDone: () => void;
}

export default function Onboarding({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-bg/95 backdrop-blur-sm px-6">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface/80 backdrop-blur-md p-8 text-center shadow-xl">
        <button
          onClick={onDone}
          className="absolute right-4 top-4 text-xs text-muted"
        >
          Пропустити
        </button>

        {slide.tab !== null && (
          <div className="mx-auto mb-4 mt-2 flex max-w-[220px] items-center justify-center gap-1 rounded-2xl border border-border bg-surface2/60 p-1">
            {TABS.map((t) => {
              const isActive = slide.tab === t.key;
              return (
                <div
                  key={t.key}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] transition-colors ${
                    isActive ? "bg-accent/15 text-accent2" : "text-muted"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </div>
              );
            })}
          </div>
        )}

        <Hammy mood={slide.mood} size={144} className={`mx-auto mb-4 ${slide.tab === null ? "mt-2" : ""}`} />

        <p className="text-xs font-medium uppercase tracking-wide text-accent2">
          {slide.title}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{slide.text}</p>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-1.5 bg-surface2"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
          className="mt-6 w-full rounded-2xl bg-accent py-3 text-[15px] font-medium text-white"
        >
          {isLast ? "Погнали" : index === 0 ? "Так" : "Далі"}
        </button>
      </div>
    </div>
  );
}
