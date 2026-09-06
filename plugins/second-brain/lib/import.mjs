#!/usr/bin/env node
// Import. Bring what another tool remembered into the vault, as dated
// markdown the search and the reflection can read.
//
// Handles a Google Takeout folder or zip. Two things inside it matter:
//   Keep/           one JSON per note: title, text or checklist, labels,
//                   who it is shared with, pinned, archived, trashed
//   My Activity/Gemini Apps/MyActivity.json
//                   one record per prompt, with the reply when Google
//                   included it, and a timestamp
//
// Everything lands under reference/, which is the capture layer: kept as
// found, never pruned. Distilling what is durable out of it is a
// conversation, not a script, and the import-notes skill runs that after.
//
// Never overwrites. A second run of the same export skips files that
// already exist, so it is safe to run again after a fresh export.
//
// Usage: node import.mjs <takeout folder or .zip> [vault-path]

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { vaultPath, ledger } from "./vault.mjs";

const stamp = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const slug = (s) =>
  (s || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "untitled";
const strip = (html) =>
  (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Unzip into a temp folder if given a zip; return the folder to walk. */
function materialize(input) {
  if (fs.statSync(input).isDirectory()) return { dir: input, cleanup: null };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "takeout-"));
  execFileSync(process.platform === "win32" ? "tar" : "unzip", process.platform === "win32" ? ["-xf", input, "-C", tmp] : ["-q", input, "-d", tmp], { stdio: "pipe" });
  return { dir: tmp, cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }) };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** One Keep note file to markdown. Returns null for trashed notes. */
function keepNote(file) {
  let n;
  try {
    n = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
  if (n.isTrashed) return null;
  const created = new Date((n.createdTimestampUsec || 0) / 1000);
  const edited = new Date((n.userEditedTimestampUsec || n.createdTimestampUsec || 0) / 1000);
  const labels = (n.labels || []).map((l) => l.name).filter(Boolean);
  const shared = (n.sharees || []).filter((s) => !s.isOwner).map((s) => s.email).filter(Boolean);
  const body = [];
  if (n.textContent) body.push(n.textContent.trim());
  if (Array.isArray(n.listContent) && n.listContent.length) {
    body.push(n.listContent.map((i) => `- [${i.isChecked ? "x" : " "}] ${(i.text || "").trim()}`).join("\n"));
  }
  for (const a of n.annotations || []) {
    if (a.url) body.push(`Link: ${a.title ? a.title + " " : ""}${a.url}`);
  }
  const attachments = (n.attachments || []).map((a) => a.filePath).filter(Boolean);
  if (attachments.length) body.push("Attachments in the export: " + attachments.join(", "));
  const title = (n.title || "").trim() || (n.textContent || "").trim().split("\n")[0].slice(0, 60) || "Untitled Keep note";
  const fm = [
    "---",
    `title: ${JSON.stringify(title)}`,
    "source: google-keep",
    `created: ${stamp(created)}`,
    `edited: ${stamp(edited)}`,
    `last_touched: ${stamp(new Date())}`,
    labels.length ? `labels: [${labels.map((l) => JSON.stringify(l)).join(", ")}]` : null,
    shared.length ? `shared_with: [${shared.map((s) => JSON.stringify(s)).join(", ")}]` : null,
    n.isPinned ? "pinned: true" : null,
    n.isArchived ? "archived_in_keep: true" : null,
    "---",
  ].filter(Boolean);
  return {
    name: `${stamp(created)}-${slug(title)}.md`,
    text: fm.join("\n") + `\n\n# ${title}\n\n${body.join("\n\n")}\n`,
    shared: shared.length > 0,
  };
}

/** Gemini activity records, grouped into one markdown file per day. */
function geminiDays(file) {
  let rows;
  try {
    rows = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return new Map();
  }
  const days = new Map();
  for (const r of Array.isArray(rows) ? rows : []) {
    const when = r.time ? new Date(r.time) : null;
    if (!when || isNaN(when)) continue;
    const day = stamp(when);
    const hh = String(when.getHours()).padStart(2, "0") + ":" + String(when.getMinutes()).padStart(2, "0");
    const prompt = (r.title || "").replace(/^Prompted\s*/i, "").trim();
    // Google has shipped the reply under several keys over time. Take any of them.
    const replyParts = [];
    for (const item of r.safeHtmlItem || []) if (item?.html) replyParts.push(strip(item.html));
    for (const s of r.subtitles || []) if (s?.name) replyParts.push(s.name);
    if (typeof r.details === "string") replyParts.push(r.details);
    const reply = replyParts.filter(Boolean).join("\n\n").trim();
    if (!prompt && !reply) continue;
    if (!days.has(day)) days.set(day, []);
    days.get(day).push({ hh, prompt, reply });
  }
  return days;
}

export function run(input, vault) {
  const { dir, cleanup } = materialize(input);
  const files = walk(dir);
  const report = { keep: 0, keepShared: 0, keepSkipped: 0, geminiDays: 0, geminiTurns: 0, existing: 0 };
  try {
    // ---- Keep ---------------------------------------------------------
    const keepFiles = files.filter((f) => /[\\/]Keep[\\/].*\.json$/i.test(f));
    if (keepFiles.length) {
      const out = path.join(vault, "reference", "keep");
      fs.mkdirSync(out, { recursive: true });
      for (const f of keepFiles) {
        const note = keepNote(f);
        if (!note) {
          report.keepSkipped++;
          continue;
        }
        const dest = path.join(out, note.name);
        if (fs.existsSync(dest)) {
          report.existing++;
          continue;
        }
        fs.writeFileSync(dest, note.text, "utf8");
        report.keep++;
        if (note.shared) report.keepShared++;
      }
    }
    // ---- Gemini -------------------------------------------------------
    const gem = files.find((f) => /Gemini Apps[\\/]MyActivity\.json$/i.test(f));
    if (gem) {
      const out = path.join(vault, "reference", "gemini");
      fs.mkdirSync(out, { recursive: true });
      for (const [day, turns] of geminiDays(gem)) {
        const dest = path.join(out, `${day}.md`);
        if (fs.existsSync(dest)) {
          report.existing++;
          continue;
        }
        turns.sort((a, b) => a.hh.localeCompare(b.hh));
        const lines = [
          "---",
          `title: "Gemini, ${day}"`,
          "source: gemini-apps",
          `date: ${day}`,
          `last_touched: ${stamp(new Date())}`,
          `turns: ${turns.length}`,
          "---",
          "",
          `# Gemini, ${day}`,
          "",
        ];
        for (const t of turns) {
          lines.push(`## ${t.hh}`, "", `**Asked:** ${t.prompt || "(empty)"}`, "");
          if (t.reply) lines.push(t.reply, "");
        }
        fs.writeFileSync(dest, lines.join("\n"), "utf8");
        report.geminiDays++;
        report.geminiTurns += turns.length;
      }
    }
  } finally {
    if (cleanup) cleanup();
  }
  const bits = [];
  if (report.keep) bits.push(`${report.keep} Keep notes (${report.keepShared} shared)`);
  if (report.geminiDays) bits.push(`${report.geminiTurns} Gemini turns across ${report.geminiDays} days`);
  if (bits.length) ledger(vault, `import: ${bits.join(", ")} into reference/`);
  return report;
}

function main() {
  const input = process.argv[2];
  const vault = process.argv[3] ? path.resolve(process.argv[3]) : vaultPath();
  if (!input || !fs.existsSync(input)) {
    console.error("import: give me the Takeout folder or zip");
    process.exit(1);
  }
  if (!vault) {
    console.error("import: no vault configured");
    process.exit(1);
  }
  const r = run(path.resolve(input), vault);
  console.log(
    `import: ${r.keep} Keep notes written (${r.keepShared} shared with someone, ${r.keepSkipped} trashed and skipped), ` +
      `${r.geminiTurns} Gemini turns across ${r.geminiDays} days, ${r.existing} already there and left alone`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (err) {
    console.error("import failed: " + err.message);
    process.exit(1);
  }
}
