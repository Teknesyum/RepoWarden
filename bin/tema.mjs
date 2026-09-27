import { readFileSync } from "node:fs";
import { join } from "node:path";

const load = (root, file) => { try { return JSON.parse(readFileSync(join(root, "teknesyum-ui", file), "utf8")); } catch { return null; } };

export function tema(root, stream = process.stdout) {
  const t = load(root, "theme.tokens.json");
  const lang = /^tr/i.test(process.env.LANG ?? Intl.DateTimeFormat().resolvedOptions().locale) ? "tr" : "en";
  const labels = load(root, join("css", `labels.${lang}.json`)) ?? {};
  const all = { ...t?.brand, ...t?.role };
  const hex = (k, seen = 0) => { const v = all[k]; if (!v || seen > 8) return null; return v.value ?? (v.ref ? hex(v.ref, seen + 1) : null); };
  const on = !!t && stream.isTTY && !("NO_COLOR" in process.env) && process.env.TERM !== "dumb";
  const paint = (k) => (s) => {
    const h = on && hex(k);
    if (!h) return String(s);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    return `\x1b[38;2;${r};${g};${b}m${s}\x1b[39m`;
  };
  const c = {
    heading: paint("renk-1"), label: paint("text-label"), text: paint("text"),
    danger: paint("danger-text"), warning: paint("warning"), success: paint("success"), accent: paint("renk-3-text"),
  };
  c.sev = { critical: c.danger, high: c.warning, medium: c.label, low: c.text, ok: c.success };
  c.hex = (k) => (hex(k) ?? "").replace("#", "");
  let name = null;
  try { name = JSON.parse(readFileSync(join(root, "teknesyum.json"), "utf8")).name; } catch {}
  c.title = name ?? labels["app.title"];
  c.setTitle = () => { if (on) stream.write(`\x1b]0;${c.title}\x07`); };
  return c;
}
