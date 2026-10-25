import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

function ensure() {
  if (getApps().length) return;
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }) });
}

/** Admin SDK ilk kullanıldığı anda (istek sırasında) başlar; `next build` sırasında başlamaz. */
function lazy<T extends object>(get: () => T): T {
  return new Proxy({} as T, {
    get(_, prop) {
      const target = get() as unknown as Record<string | symbol, unknown>;
      const v = target[prop];
      return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(target) : v;
    },
  });
}
export const adminDb = lazy<Firestore>(() => { ensure(); return getFirestore(); });
export const adminAuth = lazy<Auth>(() => { ensure(); return getAuth(); });
