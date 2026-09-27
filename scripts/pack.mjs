import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) { console.error("Usage: node scripts/pack.mjs <x.y.z>"); process.exit(1); }
const files = ["repowarden.cmd", "bin", "teknesyum-ui", "rules.json", "rules.generic.json", "prompts", "assets/icon", "LICENSE", "README.md", "README.tr.md"];
const out = join(root, "dist", `RepoWarden-${version}-win.zip`);
mkdirSync(dirname(out), { recursive: true });
rmSync(out, { force: true });
execFileSync("tar", ["-a", "-c", "-f", out, ...files], { cwd: root, stdio: "inherit" });
console.log(out);
