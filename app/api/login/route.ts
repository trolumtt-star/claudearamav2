import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/admin";
import { checkKey, safeEq } from "@/lib/server-creds";

export const runtime = "nodejs";

/** Single login endpoint: platform owner (env credentials) or a business (username + key). Returns a Firebase custom token. */
export async function POST(req: NextRequest) {
  const { username = "", password = "" } = await req.json().catch(() => ({}));
  const u = String(username).trim().toLowerCase(), p = String(password);
  const AU = process.env.ADMIN_USERNAME?.toLowerCase(), AP = process.env.ADMIN_PASSWORD;

  let uid = "", claims: Record<string, string> | null = null;
  if (AU && AP && safeEq(u, AU) && safeEq(p, AP)) {
    uid = "platform-admin"; claims = { role: "admin" };
  } else if (u && p) {
    const snap = await adminDb.collection("credentials").where("username", "==", u).limit(1).get();
    const d = snap.docs[0];
    if (d && checkKey(p, d.data().keyHash)) { uid = `tenant-${d.id}`; claims = { role: "tenant", tenantId: d.id }; }
  }
  if (!claims) {
    await new Promise((r) => setTimeout(r, 700)); // slows brute force
    return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
  }
  return NextResponse.json({ token: await adminAuth.createCustomToken(uid, claims) });
}
