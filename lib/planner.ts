import { Task, Priority } from "./types";
import { todayISO } from "./storage";

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function daysUntil(deadline: string | null): number {
  if (!deadline) return Infinity;
  const today = new Date(todayISO());
  const d = new Date(deadline);
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Sorts tasks the way the day's plan should be read: overdue first,
 * then by priority (high -> low), then by nearest deadline, then
 * shorter tasks first. Used both to pick today's plan and to render
 * it in the same order.
 */
export function sortByPriorityAndDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const da = daysUntil(a.deadline);
    const db = daysUntil(b.deadline);
    const overdueA = da <= 0 ? -1 : 0;
    const overdueB = db <= 0 ? -1 : 0;
    if (overdueA !== overdueB) return overdueA - overdueB;

    const pw = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (pw !== 0) return pw;

    if (da !== db) return da - db;

    return a.estimatedMinutes - b.estimatedMinutes;
  });
}

export function buildTodayPlan(backlog: Task[], budgetMinutes: number): Task[] {
  const scored = sortByPriorityAndDeadline(backlog);

  const plan: Task[] = [];
  let used = 0;

  for (const task of scored) {
    const isUrgent = daysUntil(task.deadline) <= 0 && task.deadline !== null;
    if (used + task.estimatedMinutes <= budgetMinutes || isUrgent) {
      plan.push(task);
      used += task.estimatedMinutes;
    }
  }

  return plan;
}

export function totalMinutes(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} хв`;
  if (m === 0) return `${h} год`;
  return `${h} год ${m} хв`;
}

export function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const diff = daysUntil(deadline);
  if (diff < 0) return `прострочено (${Math.abs(diff)} дн. тому)`;
  if (diff === 0) return "сьогодні";
  if (diff === 1) return "завтра";
  if (diff <= 6) return `через ${diff} дн.`;
  const d = new Date(deadline);
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}
