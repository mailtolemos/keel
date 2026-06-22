import Link from "next/link";

// Keel "K" mark — vertical stem + boomerang chevron, in the brand violet.
export function Mark({ size = 26, color = "#4E2BD6" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill={color} aria-hidden>
      <path d="M16 13 L24 13 L24 47 Q24 51 20 51 Q16 51 16 47 Z" />
      <path d="M27 32 L49 13 L36 32 L49 51 Z" />
    </svg>
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <Mark />
      <span className={light ? "text-white text-[17px]" : "text-navy text-[17px]"}>Keel</span>
    </Link>
  );
}
