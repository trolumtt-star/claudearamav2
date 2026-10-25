import type { Timestamp } from "firebase/firestore";
export interface AssistantConfig { businessName: string; address: string; hours: string; menu: string; greeting: string }
export interface Tenant {
  id: string; businessName: string; ownerName: string; ownerPhone: string; businessAddress: string;
  vapiAssistantId: string; username: string; webhookUrl: string; subscriptionStatus: "active" | "passive";
  remainingMinutes: number; createdAt?: Timestamp; assistantConfig?: AssistantConfig;
}
export interface Reservation {
  id: string; tenantId: string; customerName: string; customerPhone: string; date: string; time: string;
  partySize?: number; treatmentType?: string; status: "confirmed" | "cancelled" | "pending";
  createdAt?: Timestamp; source?: "ai" | "manual";
}
export interface CallLog { id: string; tenantId: string; durationSeconds: number; outcome: "success" | "failed" }
