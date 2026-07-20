"use client";

import { useCallback, useEffect, useState } from "react";
import { Task } from "./types";

const STORAGE_KEY = "ai-planner-tasks-v1";
const LAST_ACTIVE_DAY_KEY = "ai-planner-last-active-day-v1";

function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Runs once per day: if the day has changed since last visit,
 * any task still marked scheduledForToday-but-not-completed from a
 * previous day is pushed back into the backlog (Inbox) automatically,
 * with postponedCount incremented.
 */
function rolloverIfNewDay(tasks: Task[]): Task[] {
  if (typeof window === "undefined") return tasks;
  const last = window.localStorage.getItem(LAST_ACTIVE_DAY_KEY);
  const today = todayISO();
  if (last === today) return tasks;
  window.localStorage.setItem(LAST_ACTIVE_DAY_KEY, today);
  if (!last) return tasks; // first ever visit, nothing to roll over
  return tasks.map((t) =>
    t.scheduledForToday && !t.completed
      ? { ...t, scheduledForToday: false, postponedCount: (t.postponedCount || 0) + 1 }
      : t
  );
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = rolloverIfNewDay(loadTasks());
    setTasks(loaded);
    saveTasks(loaded);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Task[] | ((prev: Task[]) => Task[])) => {
    setTasks((prev) => {
      const resolved = typeof next === "function" ? (next as (p: Task[]) => Task[])(prev) : next;
      saveTasks(resolved);
      return resolved;
    });
  }, []);

  const addTasks = useCallback(
    (newTasks: Task[]) => {
      persist((prev) => [...prev, ...newTasks]);
    },
    [persist]
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      persist((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    [persist]
  );

  const deleteTask = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((t) => t.id !== id));
    },
    [persist]
  );

  const setTodayPlan = useCallback(
    (ids: string[]) => {
      persist((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, scheduledForToday: true } : t))
      );
    },
    [persist]
  );

  return { tasks, hydrated, addTasks, updateTask, deleteTask, setTodayPlan };
}

export { todayISO };
