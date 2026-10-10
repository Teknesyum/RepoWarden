import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) { console.error("Usage: node scripts/pack.mjs <x.y.z>"); process.exit(1); }
const files = ["repowarden.cmd", "bin", "teknesyum-ui", "rules.json", "rules.generic.json", "prompts", "assets/icon", "LICENSE", "README.md", "README.tr.md"];
const out = join(root, "dist", `RepoWarden-${version}-win.zip`);
mkdirSync(dirname(out), { recursive: true });
rmSync(out, { force: true });
if (!existsSync(join(root, "dist", "RepoWarden.exe"))) { console.error("dist/RepoWarden.exe is missing; run build.ps1 first."); process.exit(1); }
execFileSync("tar", ["-a", "-c", "-f", out, "-C", join(root, "dist"), "RepoWarden.exe", "-C", root, ...files], { cwd: root, stdio: "inherit" });
console.log(out);
