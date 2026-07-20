"use client";

import { useState } from "react";
import { Trash2, ChevronDown, Clock, CalendarDays, Check } from "lucide-react";
import { Task, Priority } from "@/lib/types";
import { formatMinutes, formatDeadline } from "@/lib/planner";

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Високий",
  medium: "Середній",
  low: "Низький",
};

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-high",
  medium: "bg-medium",
  low: "bg-low",
};

const PRIORITY_TEXT: Record<Priority, string> = {
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
};

interface Props {
  task: Task;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onToggleComplete?: () => void;
  showCompleteCheckbox?: boolean;
}

export default function TaskCard({
  task,
  onUpdate,
  onDelete,
  onToggleComplete,
  showCompleteCheckbox = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const deadlineLabel = formatDeadline(task.deadline);
  const overdue = deadlineLabel?.startsWith("простроч");

  return (
    <div
      className={`rounded-2xl border border-border bg-surface transition-opacity ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        {showCompleteCheckbox && (
          <button
            onClick={onToggleComplete}
            aria-label="Позначити виконаним"
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              task.completed ? "border-low bg-low" : "border-border"
            }`}
          >
            {task.completed && <Check size={14} className="text-bg" strokeWidth={3} />}
          </button>
        )}

        <button className="flex-1 text-left" onClick={() => setExpanded((e) => !e)}>
          <p className={`text-[15px] leading-snug ${task.completed ? "line-through" : ""}`}>
            {task.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
              <span className={PRIORITY_TEXT[task.priority]}>{PRIORITY_LABEL[task.priority]}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatMinutes(task.estimatedMinutes)}
            </span>
            {deadlineLabel && (
              <span className={`flex items-center gap-1 ${overdue ? "text-high" : ""}`}>
                <CalendarDays size={12} />
                {deadlineLabel}
              </span>
            )}
            {task.postponedCount > 0 && (
              <span className="text-muted">↻ переносилось {task.postponedCount}×</span>
            )}
          </div>
        </button>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-0.5 shrink-0 text-muted"
          aria-label="Редагувати"
        >
          <ChevronDown
            size={18}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <label className="block text-xs text-muted">
            Назва
            <input
              type="text"
              value={task.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </label>

          <div className="flex gap-2">
            <label className="flex-1 text-xs text-muted">
              Пріоритет
              <select
                value={task.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as Priority })}
                className="mt-1 w-full rounded-lg border border-border bg-surface2 px-2 py-2 text-sm text-white outline-none focus:border-accent"
              >
                <option value="high">Високий</option>
                <option value="medium">Середній</option>
                <option value="low">Низький</option>
              </select>
            </label>

            <label className="flex-1 text-xs text-muted">
              Час, хв
              <input
                type="number"
                min={5}
                step={5}
                value={task.estimatedMinutes}
                onChange={(e) => onUpdate({ estimatedMinutes: Number(e.target.value) || 5 })}
                className="mt-1 w-full rounded-lg border border-border bg-surface2 px-2 py-2 text-sm text-white outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="block text-xs text-muted">
            Дедлайн
            <input
              type="date"
              value={task.deadline ?? ""}
              onChange={(e) => onUpdate({ deadline: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </label>

          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs text-high"
          >
            <Trash2 size={14} />
            Видалити задачу
          </button>
        </div>
      )}
    </div>
  );
}
