"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Check, LayoutDashboard, PhoneIncoming, Radio, ShieldCheck } from "lucide-react";
import { Aurora, Counter, Reveal, Spotlight, Wave } from "@/components/fx";
import { useAuth } from "@/lib/auth-context";

const script = [
  ["Müşteri", "Merhaba, bu akşam 4 kişilik masa var mı?"],
  ["Dinlio", "Elbette! Saat kaçta gelmek istersiniz?"],
  ["Müşteri", "20:30 olsun. Adım Ayşe Yılmaz."],
  ["Dinlio", "Tamam Ayşe Hanım, 20:30 için 4 kişilik masanız ayrıldı."],
];
const sectors = ["Restoran", "Diş Kliniği", "Kuaför", "Güzellik Merkezi", "Veteriner", "Spa", "Fizyoterapi", "Oto Servis", "Cafe", "Berber"];

function LiveCall() {
  const [n, setN] = useState(1);
  useEffect(() => { const t = setInterval(() => setN((x) => (x >= 6 ? 1 : x + 1)), 2300); return () => clearInterval(t); }, []);
  return (
    <div className="relative">
      <div className="glass bg-slate-900/60 p-5 shadow-[0_0_80px_rgba(0,242,254,.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-300"><span className="relative flex h-2 w-2"><span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" /></span>Canlı çağrı</div>
          <Wave bars={22} className="h-7" />
        </div>
        <div className="mt-5 min-h-[230px] space-y-3">
          <AnimatePresence initial={false}>
            {script.slice(0, Math.min(n, 4)).map(([who, text], i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .4 }}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${who === "Dinlio" ? "ml-auto bg-neon/15 text-cyan-100" : "bg-white/8 text-slate-200"}`}>
                <div className="mb-0.5 text-xs text-slate-400">{who}</div>{text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {n >= 5 && (
          <motion.div initial={{ opacity: 0, scale: .8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="absolute -bottom-6 -left-4 sm:-left-10">
            <div className="float glass flex items-center gap-3 bg-slate-900/90 px-4 py-3 shadow-xl">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check size={18} /></span>
              <div className="text-sm"><div className="font-medium text-white">Ayşe Yılmaz · 4 kişi</div><div className="text-xs text-slate-400">Bugün 20:30 · panele eklendi</div></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const { role } = useAuth();
  return (
    <div className="relative overflow-x-clip">
      <Aurora />
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-white"><Wave bars={5} className="h-5" />Dinlio</Link>
        <Link href={role === "admin" ? "/admin" : role === "tenant" ? "/dashboard" : "/login"} className="btn-primary">{role ? "Panele git" : "Giriş yap"}</Link>
      </nav>

      <header className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 lg:grid-cols-2 lg:pt-24">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: [.22, 1, .36, 1] }}
            className="shine font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Telefonunuz artık hiç kaçmıyor.</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .7 }} className="mt-6 max-w-md text-lg text-slate-400">
            Dinlio çağrıları yanıtlar, müşteriyle konuşur ve rezervasyonu doğrudan panelinize yazar. Siz işinize bakın.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45, duration: .7 }} className="mt-9 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary !px-6 !py-3 text-base">İşletme paneline gir <ArrowRight size={18} /></Link>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .3, duration: .9, ease: [.22, 1, .36, 1] }}><LiveCall /></motion.div>
      </header>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.02] py-5">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
          <div className="marquee">
            {[...sectors, ...sectors].map((s, i) => <span key={i} className="mx-8 font-display text-2xl text-slate-500">{s}</span>)}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-6 px-5 py-20 text-center sm:grid-cols-3">
        {[[24, "/7", "Kesintisiz çağrı yanıtı"], [98, "%", "Çağrıya ilk sesle cevap"], [3, " sn", "Ortalama karşılama süresi"]].map(([to, s, l], i) => (
          <Reveal key={i} delay={i * .1}>
            <div className="font-display text-6xl font-semibold text-white">{s === "%" ? <Counter to={to as number} prefix="%" /> : <Counter to={to as number} suffix={s as string} />}</div>
            <div className="mt-2 text-slate-400">{l}</div>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-5 px-5 pb-24 md:grid-cols-3">
        <Reveal className="md:col-span-2"><Spotlight className="h-full p-8">
          <PhoneIncoming className="text-neon" /><h3 className="mt-4 font-display text-2xl text-white">Her çağrıyı karşılar</h3>
          <p className="mt-2 max-w-md text-slate-400">Yoğun saatte de, gece yarısı da. Menünüzü, fiyatlarınızı ve çalışma saatlerinizi bilir, müşteriye doğal bir sesle yanıt verir.</p>
          <Wave bars={48} className="mt-8 h-16" />
        </Spotlight></Reveal>
        <Reveal delay={.1}><Spotlight className="h-full p-8">
          <CalendarCheck className="text-neon" /><h3 className="mt-4 font-display text-2xl text-white">Rezervasyonu kendisi yazar</h3>
          <p className="mt-2 text-slate-400">İsim, telefon, tarih ve kişi sayısı panelinize saniyeler içinde düşer.</p>
        </Spotlight></Reveal>
        <Reveal><Spotlight className="h-full p-8">
          <Radio className="text-neon" /><h3 className="mt-4 font-display text-2xl text-white">Canlı panel</h3>
          <p className="mt-2 text-slate-400">Sayfayı yenilemeden yeni randevuları, çağrı sayısını ve kalan dakikanızı izleyin.</p>
        </Spotlight></Reveal>
        <Reveal delay={.1} className="md:col-span-2"><Spotlight className="h-full p-8">
          <ShieldCheck className="text-neon" /><h3 className="mt-4 font-display text-2xl text-white">Size özel hesap, yalnızca sizin verileriniz</h3>
          <p className="mt-2 max-w-md text-slate-400">Her işletme kendi kullanıcı adı ve anahtarıyla girer. Başka bir işletmenin kayıtlarına erişim mümkün değildir.</p>
        </Spotlight></Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-28">
        <Reveal><div className="glass relative overflow-hidden p-10 text-center sm:p-16">
          <div className="blob b1 !opacity-20" />
          <h2 className="relative font-display text-4xl font-semibold text-white sm:text-5xl">Paneliniz hazır mı?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-slate-400">Dinlio ekibinden aldığınız kullanıcı adı ve anahtarla giriş yapın.</p>
          <Link href="/login" className="btn-primary relative mt-8 !px-7 !py-3 text-base"><LayoutDashboard size={18} /> Giriş yap</Link>
        </div></Reveal>
      </section>
      <footer className="relative z-10 pb-10 text-center text-sm text-slate-600">© {new Date().getFullYear()} Dinlio AI</footer>
    </div>
  );
}
