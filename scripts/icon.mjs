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

const shield = "M512 188 C600 234 690 260 780 268 V500 C780 668 664 774 512 838 C360 774 244 668 244 500 V268 C334 260 424 234 512 188 Z";
const fork = "M432 440 V474 C432 530 512 530 512 574 V600 M592 440 V474 C592 530 512 530 512 574";
const frame = `<rect x="48" y="48" width="928" height="928" rx="208" fill="${bg}"/>
  <rect x="64" y="64" width="896" height="896" rx="192" fill="none" stroke="url(#kenar)" stroke-width="16" opacity="0.55"/>`;
const variants = {
  a: `<g stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="${shield}" stroke="${r1}" stroke-width="56"/>
    <path d="${fork}" stroke="${r3}" stroke-width="48"/>
    <circle cx="432" cy="400" r="44" fill="${r3}"/><circle cx="592" cy="400" r="44" fill="${r3}"/>
    <circle cx="512" cy="644" r="48" fill="${r2}"/>
  </g>`,
  b: `<path d="${shield}" fill="url(#dolgu)" stroke="url(#dolgu)" stroke-width="56" stroke-linejoin="round"/>
  <g stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="${fork}" stroke="${bg}" stroke-width="48"/>
    <circle cx="432" cy="400" r="46" fill="${bg}"/><circle cx="592" cy="400" r="46" fill="${bg}"/>
    <circle cx="512" cy="644" r="50" fill="${bg}"/>
  </g>`,
  c: `<g stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="${shield}" stroke="${r1}" stroke-width="56"/>
    <path d="M340 510 C400 420 624 420 684 510 C624 600 400 600 340 510 Z" stroke="${r3}" stroke-width="44"/>
    <circle cx="512" cy="510" r="56" fill="${r2}"/>
  </g>`,
};
const pick = process.argv[2] ?? "b";
const build = (v) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="kenar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${r1}"/>
      <stop offset="0.5" stop-color="${r3}"/>
      <stop offset="1" stop-color="${r2}"/>
    </linearGradient>
    <linearGradient id="dolgu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${r1}"/>
      <stop offset="1" stop-color="${r3}"/>
    </linearGradient>
  </defs>
  ${frame}
  ${variants[v]}
</svg>
`;
if (process.argv[3] === "--preview") {
  const dir = process.argv[4];
  mkdirSync(dir, { recursive: true });
  for (const v of Object.keys(variants)) writeFileSync(join(dir, `${v}.svg`), build(v));
  process.exit(0);
}
const svg = build(pick);
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
