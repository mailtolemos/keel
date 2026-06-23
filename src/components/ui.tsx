import Link from "next/link";
import { initials } from "@/lib/format";

type Cls = { className?: string };

export function cn(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export function Card({ className, children }: Cls & { children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-line bg-surface shadow-card", className)}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wide">{children}</h2>
      {action}
    </div>
  );
}

export type BadgeTone = "neutral" | "accent" | "good" | "warn" | "bad" | "navy";
export function Badge({ children, tone = "neutral", className }: Cls & { children: React.ReactNode; tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-surface-2 text-ink-muted border-line",
    accent: "bg-accent-soft text-accent-700 dark:text-accent-400 border-accent-100 dark:border-line",
    good: "bg-green-50 text-good border-green-100 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/25",
    warn: "bg-amber-50 text-warn border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25",
    bad: "bg-red-50 text-bad border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/25",
    navy: "bg-navy-50 text-navy-700 border-navy-100 dark:bg-surface-3 dark:text-ink dark:border-line"
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function Dot({ tone = "neutral" }: { tone?: BadgeTone }) {
  const c: Record<BadgeTone, string> = {
    neutral: "bg-ink-faint", accent: "bg-accent", good: "bg-good", warn: "bg-warn", bad: "bg-bad", navy: "bg-navy dark:bg-ink"
  };
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", c[tone])} />;
}

const av = ["bg-navy text-white dark:bg-accent", "bg-accent text-white", "bg-graphite-700 text-white", "bg-good text-white", "bg-warn text-white"];
export function Avatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % av.length;
  if (src) return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span className={cn("inline-flex items-center justify-center rounded-full font-semibold", av[idx])}
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials(name)}
    </span>
  );
}

export type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
export function Button({
  children, variant = "primary", size = "md", className, type = "button", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return (
    <button type={type} className={cn(btnClass(variant, size), className)} {...rest}>
      {children}
    </button>
  );
}
export function btnClass(variant: BtnVariant = "primary", size: "sm" | "md" = "md") {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:shadow-focus";
  const sizes = { sm: "h-8 px-3 text-[13px]", md: "h-9 px-3.5 text-sm" };
  const variants: Record<BtnVariant, string> = {
    primary: "bg-navy text-white hover:bg-navy-700 dark:bg-accent dark:hover:bg-accent-600",
    secondary: "bg-surface text-ink border border-line hover:bg-surface-2",
    ghost: "text-ink-muted hover:bg-surface-2",
    danger: "bg-surface text-bad border border-red-200 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
  };
  return cn(base, sizes[size], variants[variant]);
}

export function LinkButton({ href, children, variant = "primary", size = "md", className }: { href: string; children: React.ReactNode; variant?: BtnVariant; size?: "sm" | "md"; className?: string }) {
  return <Link href={href} className={cn(btnClass(variant, size), className)}>{children}</Link>;
}

export const fieldClass = "h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:shadow-focus transition";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClass, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldClass, "min-h-[80px] py-2", props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldClass, "pr-8", props.className)} />;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[13px] font-medium text-ink-muted mb-1.5">{children}</label>;
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && <div className="mb-3 text-ink-faint">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="text-[13px] text-ink-soft mt-1 max-w-sm">{hint}</p>}
    </div>
  );
}

export function Progress({ value, tone = "accent" }: { value: number; tone?: BadgeTone }) {
  const c: Record<string, string> = { accent: "bg-accent", good: "bg-good", warn: "bg-warn", bad: "bg-bad", navy: "bg-navy dark:bg-ink", neutral: "bg-ink-faint" };
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
      <div className={cn("h-full rounded-full", c[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-[12px] font-medium text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-ink-soft">{sub}</p>}
    </Card>
  );
}
