"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarCheck, LayoutDashboard, LogOut, Mic } from "lucide-react";
import { useRequireRole } from "@/lib/auth-context";
import { Aurora, Wave } from "@/components/fx";
import { Spinner } from "@/components/ui";

const nav = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Rezervasyonlar", icon: CalendarCheck },
  { href: "/dashboard/assistant", label: "Sesli Asistan", icon: Mic },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready, logout } = useRequireRole("tenant");
  const path = usePathname();
  if (!ready) return <Spinner />;
  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      <Aurora />
      <motion.aside initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="glass relative z-10 m-3 flex gap-1 p-3 md:sticky md:top-3 md:w-60 md:flex-col md:self-start">
        <div className="hidden items-center gap-2 px-3 py-2 font-display text-lg font-semibold text-white md:flex"><Wave bars={5} className="h-4" />Dinlio</div>
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${path === href ? "text-neon" : "text-slate-300 hover:bg-white/5"}`}>
            {path === href && <motion.span layoutId="navpill" className="absolute inset-0 rounded-lg bg-neon/10 ring-1 ring-neon/30" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <Icon size={16} className="relative" /><span className="relative">{label}</span>
          </Link>
        ))}
        <button onClick={logout} className="ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 md:ml-0 md:mt-4"><LogOut size={16} /> Çıkış</button>
      </motion.aside>
      <motion.main key={path} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="relative z-10 flex-1 p-4 md:p-8">{children}</motion.main>
    </div>
  );
}
