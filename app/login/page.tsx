"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Aurora, Wave } from "@/components/fx";

export default function Login() {
  const [username, setU] = useState(""); const [password, setP] = useState("");
  const [show, setShow] = useState(false); const [error, setError] = useState(""); const [shake, setShake] = useState(0); const [busy, setBusy] = useState(false);
  const { role, loading } = useAuth(); const router = useRouter();

  useEffect(() => { if (!loading && role) router.replace(role === "admin" ? "/admin" : "/dashboard"); }, [role, loading, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      await signInWithCustomToken(auth, data.token);
    } catch (err) { setError(err instanceof Error ? err.message : "Giriş yapılamadı."); setShake((s) => s + 1); }
    setBusy(false);
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-2">
      <Aurora />
      <section className="relative z-10 hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-2 font-display text-xl font-semibold text-white"><Wave bars={5} className="h-5" />Dinlio</div>
        <div>
          <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="font-display text-5xl font-semibold leading-tight text-white">Çağrılarınız sizi beklemeden cevaplanıyor.</motion.h2>
          <Wave bars={44} className="mt-10 h-20" />
        </div>
        <p className="text-sm text-slate-500">Hesaplar Dinlio ekibi tarafından oluşturulur.</p>
      </section>

      <section className="relative z-10 grid place-items-center p-5">
        <motion.form key={shake} onSubmit={submit} initial={{ opacity: 0, y: 30, scale: .96 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: shake ? [0, -12, 10, -6, 4, 0] : 0 }} transition={{ duration: shake ? .45 : .7, ease: [.22, 1, .36, 1] }}
          className="glass w-full max-w-sm space-y-5 bg-slate-900/60 p-8 shadow-[0_0_80px_rgba(0,242,254,.1)]">
          <div><h1 className="font-display text-3xl font-semibold text-white">Giriş yap</h1><p className="mt-1 text-sm text-slate-400">Kullanıcı adınız ve anahtarınızla devam edin.</p></div>
          <label className="block space-y-1.5"><span className="text-xs text-slate-400">Kullanıcı adı</span>
            <div className="relative"><User size={16} className="absolute left-3 top-2.5 text-slate-500" /><input className="input pl-9" autoComplete="username" autoCapitalize="none" required value={username} onChange={(e) => setU(e.target.value)} /></div></label>
          <label className="block space-y-1.5"><span className="text-xs text-slate-400">Şifre / Anahtar</span>
            <div className="relative"><KeyRound size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input className="input px-9" type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setP(e.target.value)} />
              <button type="button" aria-label="Şifreyi göster" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
          {error && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-sm text-red-400">{error}</motion.p>}
          <button className="btn-primary w-full !py-2.5" disabled={busy}>{busy ? "Kontrol ediliyor…" : "Giriş yap"}</button>
        </motion.form>
      </section>
    </main>
  );
}
