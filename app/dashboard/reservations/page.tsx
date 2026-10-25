"use client";
import { useMemo, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useReservations } from "@/lib/use-tenant";
import { Field, Modal } from "@/components/ui";
import type { Reservation } from "@/lib/types";

const statusLabel = { confirmed: "Onaylandı", pending: "Bekliyor", cancelled: "İptal" } as const;
const statusStyle = { confirmed: "bg-emerald-500/15 text-emerald-300", pending: "bg-amber-500/15 text-amber-300", cancelled: "bg-red-500/15 text-red-300" } as const;
const blank = { customerName: "", customerPhone: "", date: "", time: "", detail: "", status: "confirmed" as Reservation["status"] };

export default function Reservations() {
  const { tenantId } = useAuth(); const rows = useReservations();
  const [q, setQ] = useState(""); const [date, setDate] = useState("");
  const [open, setOpen] = useState(false); const [form, setForm] = useState(blank);

  const filtered = useMemo(() => rows.filter((r) =>
    (!date || r.date === date) &&
    (!q || `${r.customerName} ${r.customerPhone}`.toLowerCase().includes(q.toLowerCase()))), [rows, q, date]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { detail, ...rest } = form;
    const n = Number(detail);
    await addDoc(collection(db, "reservations"), {
      ...rest, tenantId, source: "manual", createdAt: serverTimestamp(),
      ...(detail && !Number.isNaN(n) ? { partySize: n } : { treatmentType: detail }),
    });
    setForm(blank); setOpen(false);
  }
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-white">Rezervasyonlar</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Yeni Rezervasyon Ekle</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          <input className="input pl-9" placeholder="Müşteri adı veya telefon ara" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <input type="date" className="input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        {date && <button className="btn-ghost" onClick={() => setDate("")}>Tarihi temizle</button>}
      </div>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>{["Müşteri Adı", "Telefon Numarası", "Tarih & Saat", "Detay", "Durum"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Kayıt bulunamadı. Asistan yeni bir rezervasyon aldığında burada anında görünür.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">{r.customerName}</td>
                <td className="px-4 py-3">{r.customerPhone}</td>
                <td className="px-4 py-3 tabular-nums">{r.date} · {r.time}</td>
                <td className="px-4 py-3">{r.partySize ? `${r.partySize} kişi` : r.treatmentType}</td>
                <td className="px-4 py-3">
                  <select value={r.status} onChange={(e) => updateDoc(doc(db, "reservations", r.id), { status: e.target.value })}
                    className={`rounded-full border-0 px-2 py-1 text-xs outline-none ${statusStyle[r.status]}`}>
                    {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v} className="bg-slate-900 text-slate-200">{l}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Yeni Rezervasyon Ekle" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Müşteri Adı"><input required className="input" value={form.customerName} onChange={set("customerName")} /></Field>
            <Field label="Telefon Numarası"><input required className="input" value={form.customerPhone} onChange={set("customerPhone")} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tarih"><input required type="date" className="input" value={form.date} onChange={set("date")} /></Field>
              <Field label="Saat"><input required type="time" className="input" value={form.time} onChange={set("time")} /></Field>
            </div>
            <Field label="Kişi sayısı veya işlem türü"><input required className="input" placeholder="4 veya Diş temizliği" value={form.detail} onChange={set("detail")} /></Field>
            <Field label="Durum">
              <select className="input" value={form.status} onChange={set("status")}>
                <option value="confirmed">Onaylandı</option><option value="pending">Bekliyor</option>
              </select>
            </Field>
            <button className="btn-primary w-full">Rezervasyonu kaydet</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
