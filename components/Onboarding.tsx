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
    text: "А тут — план на сьогодні. Що встигнеш, відмічай, решту я сам
