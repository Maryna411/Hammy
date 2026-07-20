"use client";

import { useMemo, useState } from "react";
import { useTasks } from "@/lib/storage";
import NavTabs, { Tab } from "@/components/NavTabs";
import CaptureView from "@/components/CaptureView";
import InboxView from "@/components/InboxView";
import TodayView from "@/components/TodayView";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { tasks, hydrated, addTasks, updateTask, deleteTask, setTodayPlan } = useTasks();
  const [tab, setTab] = useState<Tab>("capture");

  const backlog = useMemo(
    () => tasks.filter((t) => !t.scheduledForToday && !t.completed),
    [tasks]
  );
  const todayTasks = useMemo(() => tasks.filter((t) => t.scheduledForToday), [tasks]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-accent2" size={24} />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-bg pb-24">
      {tab === "capture" && (
        <CaptureView
          onTasksParsed={(newTasks) => {
            addTasks(newTasks);
            setTab("inbox");
          }}
        />
      )}

      {tab === "inbox" && (
        <InboxView
          backlog={backlog}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onBuildPlan={setTodayPlan}
          onGoToCapture={() => setTab("capture")}
          onGoToToday={() => setTab("today")}
        />
      )}

      {tab === "today" && (
        <TodayView
          todayTasks={todayTasks}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onGoToInbox={() => setTab("inbox")}
        />
      )}

      <NavTabs
        active={tab}
        onChange={setTab}
        inboxCount={backlog.length}
        todayCount={todayTasks.filter((t) => !t.completed).length}
      />
    </div>
  );
}
