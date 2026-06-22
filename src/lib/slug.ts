import { prisma } from "./db";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "company";
}

const RESERVED = new Set(["admin", "login", "signup", "onboarding", "api", "app", "settings"]);

export async function uniqueSlug(base: string, ignoreId?: string) {
  let root = slugify(base);
  if (RESERVED.has(root)) root = `${root}-co`;
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.company.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${++n}`;
  }
}
