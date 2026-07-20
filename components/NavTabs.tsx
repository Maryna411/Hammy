"use client";

import { Mic, Inbox as InboxIcon, ListChecks } from "lucide-react";

export type Tab = "capture" | "inbox" | "today";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  inboxCount: number;
  todayCount: number;
}

export default function NavTabs({ active, onChange, inboxCount, todayCount }: Props) {
  const items: { key: Tab; label: string; icon: JSX.Element; badge?: number }[] = [
    { key: "capture", label: "Вивалити", icon: <Mic size={20} /> },
    { key: "inbox", label: "Inbox", icon: <InboxIcon size={20} />, badge: inboxCount },
    { key: "today", label: "Сьогодні", icon: <ListChecks size={20} />, badge: todayCount },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                isActive ? "text-accent2" : "text-muted"
              }`}
            >
              <span className="relative">
                {item.icon}
                {!!item.badge && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
