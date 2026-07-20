export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  estimatedMinutes: number;
  deadline: string | null; // ISO date "YYYY-MM-DD" or null
  completed: boolean;
  scheduledForToday: boolean;
  createdAt: string;
  postponedCount: number;
}

export interface ParsedTaskFromAI {
  title: string;
  priority: Priority;
  estimatedMinutes: number;
  deadline: string | null;
}
