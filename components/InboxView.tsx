"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";
import Hammy from "./Hammy";
import { HAMMY } from "@/lib/hammy";
import { buildTodayPlan, formatMinutes, totalMinutes } from "@/lib/planner";

interface Props {
  backlog: Task[];
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onBuildPlan: (ids: string[]) => void;
  onGoToCapture: () => void;
  onGoToToday: () => void;
}

export default function InboxView({
  backlog,
  onUpdate,
  onDelete,
  onBuildPlan,
  onGoToCapture,
  onGoToToday,
}: Props) {
  const [budgetHoursInput, setBudgetHoursInput] = useState("8");

  const handleBuildPlan = () => {
    const n = Number(budgetHoursInput);
    const budgetHours = !budgetHoursInput || Number.isNaN(n) ? 8 : Math.min(16, Math.max(1, n));
    const plan = buildTodayPlan(backlog, budgetHours * 60);
    onBuildPlan(plan.map((t) => t.id));
    onGoToToday();
  };

  if (backlog.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-lg font-semibold text-ink">Задачі</h1>
        <EmptyState
          icon={<Hammy mood="idle" size={48} />}
          title={HAMMY.inboxEmptyTitle}
          description={HAMMY.inboxEmptyDesc}
          action={
            <button
              onClick={onGoToCapture}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
            >
              Записати щось із голови
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Задачі</h1>
        <span className="text-sm text-muted">{backlog.length} задач</span>
      </div>
      <p className="mb-4 text-sm text-muted">
        Перевір і підправ задачі, потім сформуй план на сьогодні.
      </p>

      <div className="space-y-2.5">
        {backlog.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={(patch) => onUpdate(task.id, patch)}
            onDelete={() => onDelete(task.id)}
          />
        ))}
      </div>

      <div className="sticky bottom-[68px] mt-5 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted">Скільки годин є сьогодні?</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={16}
              value={budgetHoursInput}
              onChange={(e) => setBudgetHoursInput(e.target.value)}
              onBlur={() => {
                const n = Number(budgetHoursInput);
                const clamped = !budgetHoursInput || Number.isNaN(n) ? 1 : Math.min(16, Math.max(1, n));
                setBudgetHoursInput(String(clamped));
              }}
              className="w-14 rounded-lg border border-border bg-surface2 px-2 py-1 text-center text-ink outline-none focus:border-accent"
            />
            <span className="text-muted">год</span>
          </div>
        </div>
        <p className="mb-3 text-xs text-muted">
          У беклозі задач на {formatMinutes(totalMinutes(backlog))}
        </p>
        <button
          onClick={handleBuildPlan}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-white"
        >
          <Wand2 size={16} />
          Сформувати план на сьогодні
        </button>
      </div>
    </div>
  );
}
