"use client";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Save } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useTenantDoc } from "@/lib/use-tenant";
import { Field } from "@/components/ui";
import type { AssistantConfig } from "@/lib/types";

const blank: AssistantConfig = { businessName: "", address: "", hours: "", menu: "", greeting: "" };

export default function AssistantSettings() {
  const { tenantId } = useAuth(); const tenant = useTenantDoc();
  const [cfg, setCfg] = useState<AssistantConfig>(blank);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (tenant) setCfg({ ...blank, businessName: tenant.businessName, address: tenant.businessAddress, ...tenant.assistantConfig });
  }, [tenant]);

  const set = (k: keyof AssistantConfig) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCfg({ ...cfg, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault(); setState("saving");
    await updateDoc(doc(db, "businesses", tenantId!), { assistantConfig: cfg });
    setState("saved"); setTimeout(() => setState("idle"), 2000);
  }

  return (
    <form onSubmit={save} className="glass max-w-3xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Sesli Asistan & Bilgi Ayarları</h1>
        <p className="mt-1 text-sm text-slate-400">Asistan bu bilgilere göre müşterilerinizle konuşur. Kaydettiğiniz değişiklikler sonraki çağrıdan itibaren geçerli olur.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="İşletme Adı"><input className="input" value={cfg.businessName} onChange={set("businessName")} /></Field>
        <Field label="Çalışma Saatleri"><input className="input" placeholder="Hafta içi 09:00–22:00" value={cfg.hours} onChange={set("hours")} /></Field>
      </div>
      <Field label="Adres"><input className="input" value={cfg.address} onChange={set("address")} /></Field>
      <Field label="Menü / Hizmet Fiyat Listesi"><textarea rows={8} className="input" placeholder={"Karışık Pizza – 320 ₺\nDiş Temizliği – 1.200 ₺"} value={cfg.menu} onChange={set("menu")} /></Field>
      <Field label="Karşılama Metni"><textarea rows={3} className="input" placeholder="Merhaba, … işletmesini aradınız. Size nasıl yardımcı olabilirim?" value={cfg.greeting} onChange={set("greeting")} /></Field>
      <button className="btn-primary" disabled={state === "saving"}><Save size={16} /> {state === "saved" ? "Kaydedildi" : state === "saving" ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</button>
    </form>
  );
}
