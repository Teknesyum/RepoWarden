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

function audit(r) {
  const f = [];
  const add = (sev, text) => f.push({ sev, text });
  const topics = (r.repositoryTopics ?? []).map((t) => t.name ?? t.topic?.name).filter(Boolean);

  if (r.isPrivate) return f;
  if (r.name.toLowerCase() === O.toLowerCase()) return f;
  if (!r.description) add("medium", "No repository description.");
  if (topics.length < rules.minTopics) add("medium", `Only ${topics.length} topic(s); at least ${rules.minTopics} expected.`);
  if (!r.licenseInfo) add("high", "No license detected.");
  else if (rules.license && !String(r.licenseInfo.key ?? "").toUpperCase().startsWith(rules.license)) add("low", `License is ${r.licenseInfo.key}, expected ${rules.license}.`);
  const branch = r.defaultBranchRef?.name;
  if (rules.defaultBranch && branch && branch !== rules.defaultBranch) add("low", `Default branch is \`${branch}\`, expected \`${rules.defaultBranch}\`.`);

  const readme = file(r.name, "README.md");
  if (!readme) add("high", "No README.md.");
  else {
    for (const m of rules.readme.markers) if (!readme.includes(m)) add("medium", `README.md lacks the \`${m}\` block.`);
    if (rules.readme.mermaid && !readme.includes("```mermaid")) add("low", "README.md has no mermaid diagram.");
    if (rules.readme.twin && !file(r.name, rules.readme.twin)) add("medium", `No ${rules.readme.twin} twin.`);
  }

  const rel = gh(["api", `repos/${O}/${r.name}/releases?per_page=100`]) ?? [];
  const tags = gh(["api", `repos/${O}/${r.name}/tags?per_page=100`]) ?? [];
  if (rel.length && rel.every((x) => x.draft)) add("critical", `All ${rel.length} release(s) are drafts; \`releases/latest\` returns 404.`);
  if (tags.length && !rel.length) add("medium", `${tags.length} tag(s) but no release.`);
  const pub = new Set(rel.filter((x) => !x.draft).map((x) => x.tag_name));
  const bare = tags.filter((t) => !pub.has(t.name) && /^v?\d/.test(t.name));
  if (rel.length && bare.length) add("low", `Version tag(s) without a published release: ${bare.slice(0, 5).map((t) => `\`${t.name}\``).join(", ")}${bare.length > 5 ? " …" : ""}.`);

  return f.sort((a, b) => SEV[a.sev] - SEV[b.sev]);
}

function issueBody(repo, findings, date) {
  const lines = findings.map((x) => `- [ ] **${x.sev}** — ${x.text}`);
  return `Automated audit by [RepoWarden](https://github.com/${O}/RepoWarden) on ${date}.\n\n${lines.join("\n")}\n\nThis issue is updated on every run and closed when nothing is left.`;
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
  !rules.skip.includes(r.name) && !r.isFork &&
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
