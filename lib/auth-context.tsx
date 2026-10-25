"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "./firebase";

type Role = "admin" | "tenant" | null;
interface Ctx { user: User | null; role: Role; tenantId: string | null; loading: boolean; logout: () => Promise<void> }
const AuthCtx = createContext<Ctx>({ user: null, role: null, tenantId: null, loading: true, logout: async () => {} });

/* Roles come from Firebase custom claims: { role: "admin" } or { role: "tenant", tenantId } */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Ctx, "logout">>({ user: null, role: null, tenantId: null, loading: true });
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) return setState({ user: null, role: null, tenantId: null, loading: false });
    const { claims } = await user.getIdTokenResult(true);
    setState({ user, role: (claims.role as Role) ?? null, tenantId: (claims.tenantId as string) ?? null, loading: false });
  }), []);
  return <AuthCtx.Provider value={{ ...state, logout: () => signOut(auth) }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

export function useRequireRole(required: "admin" | "tenant") {
  const ctx = useAuth(); const router = useRouter();
  const ok = required === "admin" ? ctx.role === "admin" : ctx.role === "tenant" && !!ctx.tenantId;
  useEffect(() => { if (!ctx.loading && !ok) router.replace("/login"); }, [ctx.loading, ok, router]);
  return { ...ctx, ready: !ctx.loading && ok };
}
