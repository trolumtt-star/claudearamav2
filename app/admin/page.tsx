"use client";
import { useEffect, useState } from "react";
import { collection, doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, Copy, KeyRound, LogOut, Pause, Pencil, Play, Plus, Timer, Users } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useRequireRole } from "@/lib/auth-context";
import { Field, Modal, Spinner, StatCard } from "@/components/ui";
import { Aurora, Stagger } from "@/components/fx";
import type { Tenant } from "@/lib/types";

const empty = { businessName: "", ownerName: "", ownerPhone: "", businessAddress: "", vapiAssistantId: "", minutes: 500 };
type Creds = { businessName: string; username: string; key: string };

async function api(method: "POST" | "PATCH", body: unknown) {
  const token = await auth.currentUser!.getIdToken();
  const r = await fetch("/api/admin/tenants", { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await r.json(); if (!r.ok) throw new Error(data.error); return data;
}

function Copy1({ text, label = "Kopyala" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn-primary !px-3 !py-1.5" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? <Check size={14} /> : <Copy size={14} />} {done ? "Kopyalandı" : label}
    </button>
  );
}

export default function AdminPage() {
  const { ready, logout } = useRequireRole("admin");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState(empty); const [editing, setEditing] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creds, setCreds] = useState<Creds | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");

  useEffect(() => { if (ready) return onSnapshot(collection(db, "businesses"), (s) => setTenants(s.docs.map((d) => ({ id: d.id, ...d.data() } as Tenant)))); }, [ready]);

  const selected = tenants.find((t) => t.id === selectedId);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: k === "minutes" ? Number(e.target.value) : e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      if (editing) { const { minutes, ...rest } = form; void minutes; await updateDoc(doc(db, "businesses", editing), rest); }
      else { const r = await api("POST", form); setSelectedId(r.tenantId); setCreds({ businessName: form.businessName, username: r.username, key: r.key }); }
      setForm(empty); setEditing(null);
    } catch (x) { setErr(x instanceof Error ? x.message : "İşlem başarısız"); }
    setBusy(false);
  }
  async function resetKey(t: Tenant) {
    if (!confirm(`${t.businessName} için yeni anahtar üretilsin mi? Eski anahtar çalışmayı bırakır.`)) return;
    const r = await api("PATCH", { tenantId: t.id }); setCreds({ businessName: t.businessName, username: r.username, key: r.key });
  }
  const edit = (t: Tenant) => { setEditing(t.id); setForm({ businessName: t.businessName, ownerName: t.ownerName, ownerPhone: t.ownerPhone, businessAddress: t.businessAddress, vapiAssistantId: t.vapiAssistantId, minutes: t.remainingMinutes }); };
  const toggle = (t: Tenant) => updateDoc(doc(db, "businesses", t.id), { subscriptionStatus: t.subscriptionStatus === "active" ? "passive" : "active" });
  const addMinutes = (t: Tenant) => { const n = Number(prompt(`${t.businessName} için eklenecek dakika:`, "100")); if (n > 0) updateDoc(doc(db, "businesses", t.id), { remainingMinutes: increment(n) }); };

  if (!ready) return <Spinner />;
  return (
    <div className="relative min-h-screen">
      <Aurora />
      <main className="relative z-10 mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold text-white">Platform Yönetimi</h1>
          <button className="btn-ghost" onClick={logout}><LogOut size={16} /> Çıkış</button>
        </header>

        <Stagger className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Toplam İşletme" value={tenants.length} icon={<Building2 size={18} />} />
          <StatCard label="Aktif İşletme" value={tenants.filter((t) => t.subscriptionStatus === "active").length} icon={<Users size={18} />} />
          <StatCard label="Dağıtılmış Dakika" value={tenants.reduce((a, t) => a + (t.remainingMinutes || 0), 0)} icon={<Timer size={18} />} />
        </Stagger>

        <section className="grid gap-6 lg:grid-cols-5">
          <form onSubmit={submit} className="glass space-y-3 p-6 lg:col-span-3">
            <h2 className="font-display text-xl font-semibold text-white">{editing ? "İşletmeyi Düzenle" : "Yeni İşletme Ekle"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="İşletme Adı"><input required className="input" value={form.businessName} onChange={set("businessName")} /></Field>
              <Field label="İşletme Sahibi Adı Soyadı"><input required className="input" value={form.ownerName} onChange={set("ownerName")} /></Field>
              <Field label="Telefon Numarası"><input required className="input" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="+90 5xx xxx xx xx" /></Field>
              <Field label="Vapi.ai Assistant ID"><input required className="input" value={form.vapiAssistantId} onChange={set("vapiAssistantId")} /></Field>
              <div className="sm:col-span-2"><Field label="Adres"><input required className="input" value={form.businessAddress} onChange={set("businessAddress")} /></Field></div>
              {!editing && <Field label="Atanan Dakika Hakkı"><input type="number" min={0} required className="input" value={form.minutes} onChange={set("minutes")} /></Field>}
            </div>
            {err && <p className="text-sm text-red-400">{err}</p>}
            <div className="flex gap-2 pt-2">
              <button className="btn-primary" disabled={busy}><Plus size={16} /> {editing ? "Değişiklikleri kaydet" : busy ? "Oluşturuluyor…" : "İşletmeyi oluştur"}</button>
              {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>Vazgeç</button>}
            </div>
          </form>

          <div className="glass flex flex-col justify-between gap-4 p-6 lg:col-span-2">
            <div><h2 className="font-display text-xl font-semibold text-white">Webhook URL</h2><p className="mt-1 text-sm text-slate-400">Bu adresi Vapi.ai asistanının Server URL alanına yapıştırın.</p></div>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="text-sm text-slate-300">{selected.businessName}</div>
                  <code className="block break-all rounded-lg bg-slate-900/70 p-3 text-xs text-neon">{selected.webhookUrl}</code>
                  <Copy1 text={selected.webhookUrl} />
                </motion.div>
              ) : <p className="text-sm text-slate-500">Tablodan bir işletme seçin veya yeni işletme oluşturun.</p>}
            </AnimatePresence>
          </div>
        </section>

        <section className="glass overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>{["İşletme Adı", "İşletme Sahibi", "Kullanıcı Adı", "Vapi Assistant ID", "Kalan Dakika", "Webhook URL", "Durum", "İşlemler"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {tenants.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Henüz işletme yok. Yukarıdaki formla ilkini ekleyin.</td></tr>}
              <AnimatePresence initial={false}>
                {tenants.map((t) => (
                  <motion.tr key={t.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(t.id)}
                    className={`cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5 ${t.id === selectedId ? "bg-neon/5" : ""}`}>
                    <td className="px-4 py-3 font-medium text-white">{t.businessName}</td>
                    <td className="px-4 py-3">{t.ownerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-cyan-200">{t.username}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.vapiAssistantId}</td>
                    <td className={`px-4 py-3 tabular-nums ${t.remainingMinutes < 30 ? "text-red-400" : ""}`}>{t.remainingMinutes}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-slate-400">{t.webhookUrl}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${t.subscriptionStatus === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/20 text-slate-400"}`}>{t.subscriptionStatus === "active" ? "Aktif" : "Pasif"}</span></td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button title="Düzenle" className="btn-ghost !px-2" onClick={() => edit(t)}><Pencil size={14} /></button>
                        <button title={t.subscriptionStatus === "active" ? "Duraklat" : "Etkinleştir"} className="btn-ghost !px-2" onClick={() => toggle(t)}>{t.subscriptionStatus === "active" ? <Pause size={14} /> : <Play size={14} />}</button>
                        <button title="Dakika ekle" className="btn-ghost !px-2" onClick={() => addMinutes(t)}><Timer size={14} /></button>
                        <button title="Yeni anahtar üret" className="btn-ghost !px-2" onClick={() => resetKey(t)}><KeyRound size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </section>
      </main>

      <AnimatePresence>
        {creds && (
          <Modal title="İşletme giriş bilgileri" onClose={() => setCreds(null)}>
            <p className="mb-4 text-sm text-slate-400"><b className="text-white">{creds.businessName}</b> için bilgiler hazır. Anahtar yalnızca şimdi gösterilir; sistemde şifreli saklanır. Şimdi kopyalayıp işletme sahibine iletin.</p>
            {([["Kullanıcı adı", creds.username], ["Anahtar", creds.key]] as const).map(([l, v]) => (
              <div key={l} className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 p-3">
                <div><div className="text-xs text-slate-500">{l}</div><code className="text-neon">{v}</code></div><Copy1 text={v} />
              </div>
            ))}
            <Copy1 text={`Kullanıcı adı: ${creds.username}\nAnahtar: ${creds.key}`} label="İkisini birlikte kopyala" />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
