export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";
import { Prisma } from "@prisma/client";

function toRecord(x: unknown): Record<string, unknown> {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : {};
}

function toJsonObject(x: unknown): Prisma.JsonObject {
  if (!x || typeof x !== "object" || Array.isArray(x)) return {};
  return x as Prisma.JsonObject;
}

function toJsonRecordString(x: unknown): Record<string, string> {
  const obj = toJsonObject(x);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    out[k] = String(v);
  }
  return out;
}

function toJsonRecordBool(x: unknown): Record<string, boolean> {
  const obj = toJsonObject(x);
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = Boolean(v);
  return out;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireUser();
    const { attemptId } = await ctx.params;

    const body = await req.json().catch(() => ({}));

    const currentIndex = Number(body.currentIndex ?? 0) || 0;
    const remainingSeconds = Number(body.remainingSeconds ?? 0) || 0;

    const selected = toRecord(body.selected);     // { "0": "A", "1": "B", ... } OR {0:"A"}
    const review = toRecord(body.review);
    const questionRefs = toRecord(body.questionRefs); // { "0": "<questionId>", ... }

    const selectedRec = toJsonRecordString(body.selected);
    const reviewRec = toJsonRecordBool(body.review);
    const questionRefsRec = toJsonRecordString(body.questionRefs);

    // Verify attempt belongs to user
    const attempt = await prisma.sectionAttempt.findFirst({
      where: { id: attemptId, userId: user.id },
      select: { id: true, status: true },
    });
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Don’t allow progress writes after submit (optional but recommended)
    if (attempt.status === "SUBMITTED") {
      return NextResponse.json({ ok: true, ignored: "already_submitted" });
    }

    // Save attempt progress snapshot
    await prisma.sectionAttempt.update({
      where: { id: attemptId },
      data: {
        currentIndex,
        remainingSeconds,
        selectedJson: selectedRec,
        reviewJson: reviewRec,
      },
    });

    // Persist answers
    // For each answered index, map -> questionId (uuid) and store answer string.
    const entries = Object.entries(selected)
      .map(([k, v]) => ({ idx: Number(k), ans: String(v ?? "").trim() }))
      .filter((x) => Number.isFinite(x.idx) && x.ans !== "");

    // Upsert answer rows
    for (const [k, ans] of Object.entries(selectedRec)) {
      const idx = Number(k);
      if (!Number.isFinite(idx)) continue;

      const qid = questionRefsRec[String(idx)];
      const a = String(ans ?? "").trim();
      if (!qid || !a) continue;

      await prisma.sectionAttemptAnswer.upsert({
        where: { attemptId_questionRef: { attemptId, questionRef: qid } },
        create: { attemptId, questionRef: qid, questionId: qid, answer: a },
        update: { questionId: qid, answer: a },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal Server Error";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
