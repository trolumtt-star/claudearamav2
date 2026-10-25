"use client";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth-context";
import type { CallLog, Reservation, Tenant } from "./types";

/** Every query is scoped to the logged-in tenantId. */
export function useTenantDoc() {
  const { tenantId } = useAuth(); const [tenant, setTenant] = useState<Tenant | null>(null);
  useEffect(() => { if (tenantId) return onSnapshot(doc(db, "businesses", tenantId), (s) => setTenant({ id: s.id, ...s.data() } as Tenant)); }, [tenantId]);
  return tenant;
}
export function useReservations() {
  const { tenantId } = useAuth(); const [rows, setRows] = useState<Reservation[]>([]);
  useEffect(() => {
    if (!tenantId) return;
    return onSnapshot(query(collection(db, "reservations"), where("tenantId", "==", tenantId)), (s) =>
      setRows(s.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation)).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))));
  }, [tenantId]);
  return rows;
}
export function useCalls() {
  const { tenantId } = useAuth(); const [rows, setRows] = useState<CallLog[]>([]);
  useEffect(() => {
    if (!tenantId) return;
    return onSnapshot(query(collection(db, "vapi_calls"), where("tenantId", "==", tenantId)), (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() } as CallLog))));
  }, [tenantId]);
  return rows;
}
