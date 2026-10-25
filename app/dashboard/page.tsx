"use client";
import { CalendarPlus, PhoneCall, Timer, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui";
import { Stagger } from "@/components/fx";
import { useCalls, useReservations, useTenantDoc } from "@/lib/use-tenant";

export default function Overview() {
  const tenant = useTenantDoc(); const reservations = useReservations(); const calls = useCalls();
  const today = new Date().toISOString().slice(0, 10);
  const todays = reservations.filter((r) => r.date === today).length;
  const rate = calls.length ? Math.round((calls.filter((c) => c.outcome === "success").length / calls.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-white">Genel Bakış{tenant && <span className="text-slate-400"> · {tenant.businessName}</span>}</h1>
      {tenant?.subscriptionStatus === "passive" && <div className="glass border-amber-400/30 p-4 text-sm text-amber-300">Hesabınız duraklatıldı. Asistan çağrı almıyor.</div>}
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bugün Alınan Rezervasyonlar" value={todays} icon={<CalendarPlus size={18} />} />
        <StatCard label="Toplam Çağrı Sayısı" value={calls.length} icon={<PhoneCall size={18} />} />
        <StatCard label="Kalan Konuşma Dakikası" value={tenant?.remainingMinutes} icon={<Timer size={18} />} />
        <StatCard label="Yapay Zeka Başarı Oranı" value={rate} prefix="%" icon={<TrendingUp size={18} />} />
      </Stagger>
    </div>
  );
}
