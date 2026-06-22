"use client";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, cn } from "@/components/ui";
import { Icon } from "@/components/icons";

type Ev = { date: string; title: string; type: "holiday" | "leave" | "oneonone" };
const tone = { holiday: "navy", leave: "accent", oneonone: "warn" } as const;

export function CalendarView({ events }: { events: Ev[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const evFor = (day: number) => events.filter((e) => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day; });
  const monthName = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader title="Calendar" subtitle="Holidays, time off, and 1:1s across the company." />
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy">{monthName}</h2>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="h-8 w-8 grid place-items-center rounded-lg border border-graphite-200 hover:bg-graphite-50"><Icon.chevron size={16} className="rotate-90" /></button>
            <button onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))} className="h-8 px-3 rounded-lg border border-graphite-200 text-[13px] hover:bg-graphite-50">Today</button>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="h-8 w-8 grid place-items-center rounded-lg border border-graphite-200 hover:bg-graphite-50"><Icon.chevron size={16} className="-rotate-90" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-graphite-200 rounded-lg overflow-hidden border border-graphite-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="bg-graphite-50 py-2 text-center text-[11px] font-medium text-graphite-500">{d}</div>)}
          {cells.map((day, i) => {
            const isToday = day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            const evs = day ? evFor(day) : [];
            return (
              <div key={i} className={cn("bg-white min-h-[88px] p-1.5", !day && "bg-graphite-50/50")}>
                {day && (
                  <>
                    <div className={cn("text-[12px] mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full", isToday ? "bg-navy text-white font-semibold" : "text-graphite-500")}>{day}</div>
                    <div className="space-y-1">
                      {evs.slice(0, 3).map((e, j) => (
                        <div key={j} className={cn("text-[10.5px] leading-tight rounded px-1 py-0.5 truncate",
                          e.type === "holiday" ? "bg-navy-50 text-navy" : e.type === "leave" ? "bg-accent-50 text-accent-700" : "bg-amber-50 text-warn")} title={e.title}>{e.title}</div>
                      ))}
                      {evs.length > 3 && <div className="text-[10px] text-graphite-400">+{evs.length - 3} more</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-[12px]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-navy-50 border border-navy-100" /> Holiday</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-accent-50 border border-accent-100" /> Time off</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-50 border border-amber-100" /> 1:1</span>
        </div>
      </Card>
    </div>
  );
}
