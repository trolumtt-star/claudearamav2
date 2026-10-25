"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Counter, item } from "./fx";

export function StatCard({ label, value, prefix, suffix, icon }: { label: string; value?: number; prefix?: string; suffix?: string; icon: ReactNode }) {
  return (
    <motion.div variants={item} whileHover={{ y: -4 }} className="glass p-5 transition-colors hover:border-neon/30">
      <div className="flex items-center justify-between text-sm text-slate-400">{label}<span className="text-neon">{icon}</span></div>
      <div className="mt-3 font-display text-4xl font-semibold text-white">{value === undefined ? "–" : <Counter to={value} prefix={prefix} suffix={suffix} />}</div>
    </motion.div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="glass w-full max-w-md bg-slate-900/90 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Kapat" className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs text-slate-400">{label}</span>{children}</label>;
}

export function Spinner() {
  return <div className="grid h-screen place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" /></div>;
}
