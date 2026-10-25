import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { base: "#0F172A", neon: "#00F2FE" },
    fontFamily: { sans: ["var(--font-body)", "system-ui", "sans-serif"], display: ["var(--font-display)", "system-ui", "sans-serif"] },
  } },
  plugins: [],
} satisfies Config;
