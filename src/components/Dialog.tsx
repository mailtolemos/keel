"use client";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { btnClass, BtnVariant, cn } from "@/components/ui";

export function Dialog({
  trigger, title, description, children, triggerVariant = "primary", triggerSize = "md", triggerClass, wide = false
}: {
  trigger: React.ReactNode; title: string; description?: string; children: (close: () => void) => React.ReactNode;
  triggerVariant?: BtnVariant; triggerSize?: "sm" | "md"; triggerClass?: string; wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button className={cn(btnClass(triggerVariant, triggerSize), triggerClass)} onClick={() => setOpen(true)}>{trigger}</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={close} />
          <div className={cn("relative z-10 w-full rounded-2xl border border-line bg-surface shadow-pop animate-fadeUp my-auto", wide ? "max-w-2xl" : "max-w-md")}>
            <div className="flex items-start justify-between p-5 pb-3">
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
              </div>
              <button onClick={close} className="h-8 w-8 grid place-items-center rounded-lg text-ink-faint hover:bg-surface-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-5 pb-5">{children(close)}</div>
          </div>
        </div>
      )}
    </>
  );
}
