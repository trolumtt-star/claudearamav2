import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/admin";
import { hashKey, makeKey, slug } from "@/lib/server-creds";

export const runtime = "nodejs";
const BASE = process.env.NEXT_PUBLIC_WEBHOOK_BASE ?? "https://api.dinlio.ai/v1/webhook";

async function isAdmin(req: NextRequest) {
  const t = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!t) return false;
  try { return (await adminAuth.verifyIdToken(t)).role === "admin"; } catch { return false; }
}
const deny = () => NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

/** Create business + its own username/key. The key is returned once; only a hash is stored. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return deny();
  const b = await req.json();
  const ref = adminDb.collection("businesses").doc();

  let username = "";
  for (let i = 0; i < 8; i++) {
    const c = `${slug(b.businessName)}${Math.floor(100 + Math.random() * 900)}`;
    if ((await adminDb.collection("credentials").where("username", "==", c).limit(1).get()).empty) { username = c; break; }
  }
  if (!username) return NextResponse.json({ error: "Kullanıcı adı üretilemedi, tekrar deneyin." }, { status: 500 });

  const key = makeKey(), webhookUrl = `${BASE}/${ref.id}`;
  await ref.set({
    businessName: b.businessName, ownerName: b.ownerName, ownerPhone: b.ownerPhone, businessAddress: b.businessAddress,
    vapiAssistantId: b.vapiAssistantId, username, webhookUrl, subscriptionStatus: "active",
    remainingMinutes: Number(b.minutes) || 0, createdAt: FieldValue.serverTimestamp(),
  });
  await adminDb.doc(`credentials/${ref.id}`).set({ username, keyHash: hashKey(key) });
  return NextResponse.json({ tenantId: ref.id, username, key, webhookUrl });
}

/** Reset a business key (old key stops working immediately). */
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return deny();
  const { tenantId } = await req.json();
  const cred = await adminDb.doc(`credentials/${tenantId}`).get();
  if (!cred.exists) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  const key = makeKey();
  await cred.ref.update({ keyHash: hashKey(key) });
  return NextResponse.json({ username: cred.data()!.username, key });
}
