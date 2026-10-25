import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/admin";

export const runtime = "nodejs";

/** Vapi Server URL target: POST {BASE}/{tenantId}. tenantId always comes from the URL, never from the payload. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const tenantRef = adminDb.doc(`businesses/${tenantId}`);
  const tenant = await tenantRef.get();
  if (!tenant.exists || tenant.data()?.subscriptionStatus !== "active")
    return NextResponse.json({ error: "Tenant inactive or not found" }, { status: 403 });

  const body = await req.json();
  const msg = body.message ?? body;

  // Her gelen istek ham haliyle webhook_events koleksiyonuna yazılır
  await adminDb.collection("webhook_events").add({
    tenantId, type: msg.type ?? "unknown", payload: JSON.stringify(body).slice(0, 100000), createdAt: FieldValue.serverTimestamp(),
  });

  // Call finished: log it and deduct minutes
  if (msg.type === "end-of-call-report") {
    const secs = Math.round(msg.durationSeconds ?? 0);
    await adminDb.collection("vapi_calls").add({
      tenantId, durationSeconds: secs,
      outcome: String(msg.analysis?.successEvaluation) === "true" ? "success" : "failed",
      createdAt: FieldValue.serverTimestamp(),
    });
    await tenantRef.update({ remainingMinutes: FieldValue.increment(-Math.ceil(secs / 60)) });
    return NextResponse.json({ ok: true });
  }

  // Tool call: create reservation
  const call = msg.toolCalls?.[0] ?? msg.toolCallList?.[0];
  const raw = call?.function?.arguments ?? body.reservation;
  if (!raw) return NextResponse.json({ ok: true, ignored: msg.type ?? "unknown" });
  const a = typeof raw === "string" ? JSON.parse(raw) : raw;

  await adminDb.collection("reservations").add({
    tenantId, customerName: a.customerName, customerPhone: a.customerPhone,
    date: a.date, time: a.time,
    ...(a.partySize ? { partySize: Number(a.partySize) } : { treatmentType: a.treatmentType ?? "" }),
    status: "confirmed", source: "ai", createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ results: [{ toolCallId: call?.id, result: "Rezervasyon kaydedildi." }] });
}
