import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const makeKey = () => randomBytes(12).toString("base64url").replace(/[-_]/g, "k").slice(0, 12);

export function hashKey(key: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(key, salt, 32).toString("hex")}`;
}
export function checkKey(key: string, stored: string) {
  const [s, h] = stored.split(":"); if (!s || !h) return false;
  const a = scryptSync(key, Buffer.from(s, "hex"), 32), b = Buffer.from(h, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
export function safeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export const slug = (s: string) =>
  s.toLowerCase().replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "").slice(0, 12) || "isletme";
