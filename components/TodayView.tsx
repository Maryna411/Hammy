"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";
import Hammy from "./Hammy";
import { HAMMY } from "@/lib/hammy";
import { formatMinutes, totalMinutes } from "@/lib/planner";

interface Props {
  todayTasks: Task[];
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onGoToInbox: () => void;
}

export default function TodayView({ todayTasks, onUpdate, onDelete, onGoToInbox }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);

  const active = useMemo(() => todayTasks.filter((t) => !t.completed), [todayTasks]);
  const completed = useMemo(() => todayTasks.filter((t) => t.completed), [todayTasks]);
  const planned = totalMinutes(todayTasks);
  const done = totalMinutes(completed);

  const todayLabel = new Date().toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (todayTasks.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-lg font-semibold text-ink capitalize">{todayLabel}</h1>
        <EmptyState
          icon={<Hammy mood="idle" size={48} />}
          title={HAMMY.todayEmptyTitle}
          description={HAMMY.todayEmptyDesc}
          action={
            <button
              onClick={onGoToInbox}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
            >
              Перейти в Задачі
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="mb-1 text-lg font-semibold text-ink capitalize">{todayLabel}</h1>
      <p className="mb-4 text-sm text-muted">
        {completed.length}/{todayTasks.length} виконано · {formatMinutes(done)} з{" "}
        {formatMinutes(planned)}
      </p>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full bg-low transition-all"
          style={{ width: `${planned ? (done / planned) * 100 : 0}%` }}
        />
      </div>

      {active.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <Hammy mood="happy" size={56} className="mx-auto mb-2" />
          <p className="text-[15px] font-medium text-ink">{HAMMY.allDoneTitle}</p>
          <p className="mt-1 text-sm text-muted">{HAMMY.allDoneDesc}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {active.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showCompleteCheckbox
              onToggleComplete={() => onUpdate(task.id, { completed: true })}
              onUpdate={(patch) => onUpdate(task.id, patch)}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-5">
          <button
            onClick={() => setShowCompleted((s) => !s)}
            className="flex items-center gap-1.5 text-sm text-muted"
          >
            Виконано ({completed.length})
            <ChevronDown
              size={16}
              className={`transition-transform ${showCompleted ? "rotate-180" : ""}`}
            />
          </button>
          {showCompleted && (
            <div className="mt-2.5 space-y-2.5">
              {completed.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showCompleteCheckbox
                  onToggleComplete={() => onUpdate(task.id, { completed: false })}
                  onUpdate={(patch) => onUpdate(task.id, patch)}
                  onDelete={() => onDelete(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
