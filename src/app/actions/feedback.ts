"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployee } from "@/lib/session";

export async function giveFeedback(input: { subjectId: string; body: string; tags: string[]; visibility: string; isRequest?: boolean }) {
  const { me, company } = await requireEmployee();
  const schema = z.object({ subjectId: z.string().min(1), body: z.string().min(1).max(2000), visibility: z.enum(["PUBLIC", "MANAGER_ONLY", "PRIVATE"]) });
  if (!schema.safeParse(input).success) return { ok: false as const, error: "Pick a person and write a note." };
  if (input.subjectId === me.id && !input.isRequest) return { ok: false as const, error: "You can't give feedback to yourself." };
  await prisma.feedback.create({
    data: {
      companyId: company.id, authorId: me.id, subjectId: input.subjectId,
      body: input.body.trim(), tags: (input.tags || []).join(","), visibility: input.visibility, isRequest: !!input.isRequest
    }
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
