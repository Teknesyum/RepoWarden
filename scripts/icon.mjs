import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const t = JSON.parse(readFileSync(join(root, "teknesyum-ui", "theme.tokens.json"), "utf8"));
const all = { ...t.brand, ...t.role };
const hex = (k) => { const v = all[k]; return v.value ?? hex(v.ref); };
const [r1, r2, r3, bg] = ["renk-1", "renk-2", "renk-3", "surface"].map(hex);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="kenar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${r1}"/>
      <stop offset="0.5" stop-color="${r3}"/>
      <stop offset="1" stop-color="${r2}"/>
    </linearGradient>
  </defs>
  <rect x="48" y="48" width="928" height="928" rx="208" fill="${bg}"/>
  <rect x="64" y="64" width="896" height="896" rx="192" fill="none" stroke="url(#kenar)" stroke-width="16" opacity="0.55"/>
  <g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="60">
    <path d="M512 200 L776 296 V500 C776 660 664 766 512 830 C360 766 248 660 248 500 V296 Z" stroke="${r1}"/>
    <circle cx="400" cy="430" r="44" fill="${r3}" stroke="${r3}"/>
    <circle cx="400" cy="640" r="44" fill="${r3}" stroke="${r3}"/>
    <line x1="400" y1="474" x2="400" y2="596" stroke="${r3}"/>
    <polyline points="508,540 574,606 680,470" stroke="${r2}"/>
  </g>
</svg>
`;

const out = join(root, "assets", "icon");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "icon.svg"), svg);

const browser = [
  `${process.env["ProgramFiles(x86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
  `${process.env.ProgramFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
].find(existsSync);
if (!browser) { console.error("No Edge or Chrome found; icon.svg written, PNG and ICO skipped."); process.exit(1); }

const tmp = join(tmpdir(), `repowarden-icon-${process.pid}`);
mkdirSync(tmp, { recursive: true });
const sizes = [16, 24, 32, 48, 64, 128, 256];
const png = {};
for (const n of [...sizes, 512]) {
  const page = join(tmp, `${n}.html`);
  writeFileSync(page, `<!doctype html><html><body style="margin:0;background:transparent">${svg.replace('width="1024" height="1024"', `width="${n}" height="${n}"`)}</body></html>`);
  const shot = join(tmp, `${n}.png`);
  execFileSync(browser, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${n},${n}`, "--default-background-color=00000000", `--screenshot=${shot}`, pathToFileURL(page).href], { stdio: "ignore" });
  png[n] = readFileSync(shot);
}
writeFileSync(join(out, "icon.png"), png[512]);
writeFileSync(join(out, "icon-256.png"), png[256]);

const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
sizes.forEach((n, i) => {
  const e = 6 + 16 * i;
  head.writeUInt8(n >= 256 ? 0 : n, e); head.writeUInt8(n >= 256 ? 0 : n, e + 1);
  head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(png[n].length, e + 8); head.writeUInt32LE(offset, e + 12);
  offset += png[n].length;
});
writeFileSync(join(out, "icon.ico"), Buffer.concat([head, ...sizes.map((n) => png[n])]));
rmSync(tmp, { recursive: true, force: true });
console.log(`icon: ${out} (svg, png 512, png 256, ico ${sizes.join("/")})`);
