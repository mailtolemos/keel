"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireEmployee } from "@/lib/session";

export async function createOneOnOne(input: { otherId: string; cadence: string; nextAt?: string }) {
  const { me, company } = await requireEmployee();
  const other = await prisma.employee.findFirst({ where: { id: input.otherId, companyId: company.id } });
  if (!other) return { ok: false as const, error: "Person not found." };
  // Manager is whoever manages the other person if it's me; otherwise default me as manager
  const managerId = other.managerId === me.id ? me.id : (me.managerId === other.id ? other.id : me.id);
  const reportId = managerId === me.id ? other.id : me.id;
  const exists = await prisma.oneOnOne.findFirst({ where: { managerId, reportId } });
  if (exists) return { ok: false as const, error: "You already have a 1:1 with this person." };
  await prisma.oneOnOne.create({ data: { managerId, reportId, cadence: input.cadence, nextAt: input.nextAt ? new Date(input.nextAt) : null } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function addNote(input: { oneOnOneId: string; agenda?: string; sharedNotes?: string; privateNotes?: string; actionItems: { text: string; done: boolean }[]; meetingDate?: string }) {
  const { me } = await requireEmployee();
  const o = await prisma.oneOnOne.findFirst({ where: { id: input.oneOnOneId, OR: [{ managerId: me.id }, { reportId: me.id }] } });
  if (!o) return { ok: false as const, error: "Not found." };
  await prisma.oneOnOneNote.create({
    data: {
      oneOnOneId: o.id, agenda: input.agenda || null, sharedNotes: input.sharedNotes || null,
      privateNotes: input.privateNotes || null, privateFor: input.privateNotes ? me.id : null,
      actionItems: JSON.stringify(input.actionItems.filter((a) => a.text.trim())),
      meetingDate: input.meetingDate ? new Date(input.meetingDate) : new Date()
    }
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function toggleAction(noteId: string, index: number) {
  const { me } = await requireEmployee();
  const note = await prisma.oneOnOneNote.findUnique({ where: { id: noteId }, include: { oneOnOne: true } });
  if (!note || (note.oneOnOne.managerId !== me.id && note.oneOnOne.reportId !== me.id)) return { ok: false as const };
  const items = note.actionItems ? JSON.parse(note.actionItems) : [];
  if (items[index]) items[index].done = !items[index].done;
  await prisma.oneOnOneNote.update({ where: { id: noteId }, data: { actionItems: JSON.stringify(items) } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
