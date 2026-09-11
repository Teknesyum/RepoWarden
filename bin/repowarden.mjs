#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

if (flag("--help") || flag("-h")) {
  console.log(`repowarden — audit every repository on a GitHub account

Usage:
  node bin/repowarden.mjs            dry run, prints the report
  node bin/repowarden.mjs --issues   also opens or updates one issue per repo
  node bin/repowarden.mjs --repo X   audit a single repository

Options:
  --owner LOGIN  account to audit (default: owner in the rules file)
  --rules FILE   rules file (default: rules.json; rules.generic.json for other accounts)
  --out FILE     report path (default: reports/audit-<date>.md)

Nothing destructive is ever run. Findings become issues, not changes.`);
  process.exit(0);
}

const rules = JSON.parse(readFileSync(opt("--rules") ?? join(root, "rules.json"), "utf8"));
const O = opt("--owner") ?? rules.owner;
if (!O) { console.error("No owner: pass --owner <login> or set it in the rules file."); process.exit(1); }

function gh(a, { json = true, raw = false } = {}) {
  try {
    const out = execFileSync("gh", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
    return json ? JSON.parse(out || "null") : out;
  } catch (e) {
    if (raw) return null;
    const msg = String(e.stderr || e.message);
    if (/404|Not Found/.test(msg)) return null;
    throw new Error(`gh ${a.join(" ")}\n${msg}`);
  }
}

const file = (repo, path) =>
  gh(["api", `repos/${O}/${repo}/contents/${path}`, "-H", "Accept: application/vnd.github.raw"], { json: false, raw: true });

const SEV = { critical: 0, high: 1, medium: 2, low: 3 };

const LANG = { "C++": "cpp", "C#": "csharp", "F#": "fsharp", "Objective-C": "objective-c", "Jupyter Notebook": "jupyter-notebook", "Vue": "vuejs", "Shell": "shell", "Dockerfile": "docker", "HTML": "html", "CSS": "css", "Makefile": null, "CMake": "cmake" };
const MANIFEST = {
  "package.json": ["nodejs"], "Cargo.toml": ["rust"], "pom.xml": ["java", "maven"], "build.gradle": ["gradle"],
  "build.gradle.kts": ["gradle", "kotlin"], "requirements.txt": ["python"], "pyproject.toml": ["python"],
  "go.mod": ["golang"], "Dockerfile": ["docker"], "docker-compose.yml": ["docker-compose"], "CMakeLists.txt": ["cmake"],
  "Gemfile": ["ruby"], "composer.json": ["php"], "pubspec.yaml": ["flutter", "dart"], "tsconfig.json": ["typescript"],
  "AndroidManifest.xml": ["android"], "hardhat.config.js": ["solidity", "ethereum"], "truffle-config.js": ["solidity", "ethereum"],
};
const STOP = new Set(["the", "a", "an", "and", "of", "for", "to", "in", "on", "with", "my", "test", "demo", "project", "app", "final", "example", "drafts", "deleteme", "client", "server"]);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

function suggestTopics(r, pkg, tree, have) {
  const out = [];
  const push = (t) => { const s = t && slug(t); if (s && s.length > 1 && !out.includes(s) && !have.includes(s)) out.push(s); };
  const langs = gh(["api", `repos/${O}/${r.name}/languages`]) ?? {};
  Object.keys(langs).slice(0, 3).forEach((l) => push(l in LANG ? LANG[l] : l));
  for (const f of tree) (MANIFEST[f] ?? []).forEach(push);
  if (tree.includes(".github")) push("github-actions");
  (pkg?.keywords ?? []).slice(0, 5).forEach(push);
  r.name.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[-_.\s]+/).filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()) && !/^\d+$/.test(w)).slice(0, 3).forEach(push);
  return out.slice(0, 8);
}

function suggestDescription(readme, pkg) {
  if (pkg?.description) return pkg.description.trim();
  if (!readme) return null;
  const para = readme.replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim()).find((p) => p && !/^(#|!\[|\[!\[|<|```|\||-{3})/.test(p));
  if (!para) return null;
  const clean = para.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`>]/g, "").replace(/\s+/g, " ").trim();
  if (clean.length < 12) return null;
  return clean.length > 140 ? clean.slice(0, 137).replace(/\s\S*$/, "") + "…" : clean;
}

const sh = (s) => `"${String(s).replace(/(["\\$`])/g, "\\$1")}"`;

function audit(r) {
  const f = [];
  const R = `${O}/${r.name}`;
  const branch = r.defaultBranchRef?.name ?? "main";
  const add = (sev, text, fix) => f.push({ sev, text, fix });
  const topics = (r.repositoryTopics ?? []).map((t) => t.name ?? t.topic?.name).filter(Boolean);

  if (r.isPrivate) return f;
  if (r.name.toLowerCase() === O.toLowerCase()) return f;

  const tree = (gh(["api", `repos/${R}/contents`]) ?? []).map((x) => x.name);
  let pkg = null;
  if (tree.includes("package.json")) { try { pkg = JSON.parse(file(r.name, "package.json") ?? "null"); } catch {} }
  const readme = gh(["api", `repos/${R}/readme`, "-H", "Accept: application/vnd.github.raw"], { json: false, raw: true });

  if (!r.description) {
    const d = suggestDescription(readme, pkg);
    add("medium", "No repository description. It is the line shown in search results and on the profile.",
      d ? `Suggested, taken from your ${pkg?.description ? "package.json" : "README"} — edit as you like:\n\`\`\`bash\ngh repo edit ${R} --description ${sh(d)}\n\`\`\``
        : `Write one sentence about what it does:\n\`\`\`bash\ngh repo edit ${R} --description "…"\n\`\`\``);
  }
  if (topics.length < rules.minTopics) {
    const s = suggestTopics(r, pkg, tree, topics);
    add("medium", `${topics.length ? `Only ${topics.length} topic(s)` : "No topics"}; at least ${rules.minTopics} help people find the repository.`,
      s.length ? `Suggested from the languages and files in the repository — keep the ones that fit:\n\`\`\`bash\ngh repo edit ${R} ${s.map((t) => `--add-topic ${t}`).join(" ")}\n\`\`\``
        : `\`\`\`bash\ngh repo edit ${R} --add-topic <topic>\n\`\`\``);
  }
  if (!r.licenseInfo) add("high", "No license detected. Without one, nobody may legally reuse the code, even if it is public.",
    `GitHub has a picker with the full text ready: [add a license](https://github.com/${R}/community/license/new?branch=${branch}). MIT is the common short choice; [choosealicense.com](https://choosealicense.com) compares the rest.`);
  else if (rules.license && !String(r.licenseInfo.key ?? "").toUpperCase().startsWith(rules.license)) add("low", `License is ${r.licenseInfo.key}, expected ${rules.license}.`);
  if (rules.defaultBranch && r.defaultBranchRef?.name && branch !== rules.defaultBranch) add("low", `Default branch is \`${branch}\`, expected \`${rules.defaultBranch}\`.`,
    `\`\`\`bash\ngh api -X POST repos/${R}/branches/${branch}/rename -f new_name=${rules.defaultBranch}\n\`\`\``);

  if (!readme) add("high", "No README. It is the first thing a visitor sees.",
    `[Create README.md](https://github.com/${R}/new/${branch}?filename=README.md) — a title, one paragraph on what it does, and how to run it is enough.`);
  else {
    for (const m of rules.readme.markers) if (!readme.includes(m)) add("medium", `README lacks the \`${m}\` block.`);
    if (rules.readme.mermaid && !readme.includes("```mermaid")) add("low", "README has no mermaid diagram.");
    if (rules.readme.twin && !file(r.name, rules.readme.twin)) add("medium", `No ${rules.readme.twin} twin.`);
  }

  const rel = gh(["api", `repos/${R}/releases?per_page=100`]) ?? [];
  const tags = gh(["api", `repos/${R}/tags?per_page=100`]) ?? [];
  if (rel.length && rel.every((x) => x.draft)) add("critical", `All ${rel.length} release(s) are drafts, so \`releases/latest\` returns 404.`,
    `Publish the newest one:\n\`\`\`bash\ngh release edit ${rel[0].tag_name} -R ${R} --draft=false\n\`\`\``);
  if (tags.length && !rel.length) add("medium", `${tags.length} tag(s) but no release.`,
    `\`\`\`bash\ngh release create ${tags[0].name} -R ${R} --verify-tag --generate-notes\n\`\`\``);
  const pub = new Set(rel.filter((x) => !x.draft).map((x) => x.tag_name));
  const bare = tags.filter((t) => !pub.has(t.name) && /^v?\d/.test(t.name));
  if (rel.length && bare.length) add("low", `Version tag(s) without a published release: ${bare.slice(0, 5).map((t) => `\`${t.name}\``).join(", ")}${bare.length > 5 ? " …" : ""}.`);

  return f.sort((a, b) => SEV[a.sev] - SEV[b.sev]);
}

function issueBody(repo, findings, date) {
  const items = findings.map((x) => `- [ ] **${x.sev}** — ${x.text}${x.fix ? `\n\n  ${x.fix.replace(/\n/g, "\n  ")}\n` : ""}`);
  return `Hi! This is a quick outside-in check of how **${repo}** looks on GitHub — description, topics, license, README and releases. It does not look at the code.

${items.join("\n")}

Every suggestion is only a starting point; change or ignore whatever does not fit. The commands need the [GitHub CLI](https://cli.github.com) and run from any folder.

<sub>Checked on ${date} by [RepoWarden](https://github.com/Teknesyum/RepoWarden). This issue is updated on the next run and closes itself when nothing is left.</sub>`;
}

function syncIssue(repo, findings, date) {
  gh(["label", "create", rules.issueLabel, "-R", `${O}/${repo}`, "--color", "c67eff", "--force"], { json: false, raw: true });
  const open = gh(["issue", "list", "-R", `${O}/${repo}`, "--label", rules.issueLabel, "--state", "open", "--json", "number"]) ?? [];
  if (!findings.length) {
    for (const i of open) gh(["issue", "close", String(i.number), "-R", `${O}/${repo}`, "-c", "RepoWarden: nothing left."], { json: false });
    return open.length ? "closed" : "clean";
  }
  const body = issueBody(repo, findings, date);
  if (open.length) {
    gh(["issue", "edit", String(open[0].number), "-R", `${O}/${repo}`, "--body", body], { json: false });
    return `updated #${open[0].number}`;
  }
  const url = gh(["issue", "create", "-R", `${O}/${repo}`, "--title", rules.issueTitle, "--label", rules.issueLabel, "--body", body], { json: false }).trim();
  return `opened ${url.split("/").pop() ? "#" + url.split("/").pop() : url}`;
}

const date = new Date().toISOString().slice(0, 10);
const only = opt("--repo");
let repos = gh(["repo", "list", O, "--limit", "200", "--json", "name,isArchived,isPrivate,isFork,description,defaultBranchRef,repositoryTopics,licenseInfo"]);
repos = repos.filter((r) =>
  !rules.skip.includes(r.name) && (!r.isFork || only) &&
  (rules.includeArchived || !r.isArchived) &&
  (rules.includePrivate || !r.isPrivate) &&
  (!only || r.name === only));
repos.sort((a, b) => a.name.localeCompare(b.name));

const rows = [];
const detail = [];
for (const r of repos) {
  const f = audit(r);
  const worst = f[0]?.sev ?? "ok";
  const action = flag("--issues") && !r.isArchived ? syncIssue(r.name, f, date) : "—";
  if (f.length) {
    const dir = join(root, "reports", "issues", O);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${r.name}.md`), issueBody(r.name, f, date));
  }
  rows.push(`| ${r.name}${r.isPrivate ? " 🔒" : ""} | ${worst} | ${f.length} | ${action} |`);
  if (f.length) detail.push(`### ${r.name}\n\n${f.map((x) => `- **${x.sev}** — ${x.text}`).join("\n")}`);
  process.stderr.write(`${r.name}: ${f.length}\n`);
}

const count = (s) => rows.filter((x) => x.split("|")[2].trim() === s).length;
const total = rows.reduce((n, x) => n + Number(x.split("|")[3]), 0);
const report = `# RepoWarden Audit — ${O} — ${date}

${repos.length} repositories audited, ${total} findings in ${repos.length - count("ok")} of them.

| Repositories | Critical | High | Medium | Low | Clean |
|---|---|---|---|---|---|
| ${repos.length} | ${count("critical")} | ${count("high")} | ${count("medium")} | ${count("low")} | ${count("ok")} |

| Repository | Worst | Findings | Issue |
|---|---|---|---|
${rows.join("\n")}

${detail.join("\n\n")}
`;

const out = opt("--out") ?? join(root, "reports", `audit-${O}-${date}.md`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, report);
console.log(report);
console.error(`report: ${out}`);
