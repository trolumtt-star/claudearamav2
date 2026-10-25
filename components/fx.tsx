"use client";
import { animate, MotionConfig, motion, useInView, Variants } from "framer-motion";
import { CSSProperties, ReactNode, useEffect, useRef } from "react";

export const MotionRoot = ({ children }: { children: ReactNode }) => <MotionConfig reducedMotion="user">{children}</MotionConfig>;

/** Number that counts up when visible and eases to new values on live updates. */
export function Counter({ to, prefix = "", suffix = "", duration = 1.4 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null); const prev = useRef(0);
  const seen = useInView(ref, { once: true });
  useEffect(() => {
    if (!seen) return;
    const c = animate(prev.current, to, {
      duration, ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString("tr-TR") + suffix; },
      onComplete: () => { prev.current = to; },
    });
    return () => c.stop();
  }, [seen, to, prefix, suffix, duration]);
  return <span ref={ref} className="tabular-nums">{prefix}0{suffix}</span>;
}

export const Aurora = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="grid-bg absolute inset-0" />
  </div>
);

export function Wave({ bars = 32, className = "" }: { bars?: number; className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-[3px] ${className}`}>
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className="bar" style={{ "--i": i, "--a": 0.35 + 0.65 * Math.abs(Math.sin(i * 0.9)) } as CSSProperties} />
      ))}
    </div>
  );
}

/** Glass card with a cursor-following light. */
export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`spot glass relative overflow-hidden ${className}`}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`); }}>
      {children}
    </div>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
export const item: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } };

export const Stagger = ({ children, className }: { children: ReactNode; className?: string }) =>
  <motion.div className={className} variants={container} initial="hidden" animate="show">{children}</motion.div>;

export const Reveal = ({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) =>
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease }}>{children}</motion.div>;
