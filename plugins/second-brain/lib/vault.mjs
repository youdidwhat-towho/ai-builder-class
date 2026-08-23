// Shared helpers for every second-brain hook.
//
// Node only, no dependencies. The old kit used Bash with `date -v` and
// `stat -f`, which are BSD-only, so nothing in it could ever run on a
// student's Windows machine. Node ships with Claude Code on both
// platforms, so one file works everywhere.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const CONFIG = path.join(os.homedir(), ".claude", "second-brain.json");

/** Where the student's vault lives. Written once by the installer. */
export function vaultPath() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
    if (cfg.vault && fs.existsSync(cfg.vault)) return cfg.vault;
  } catch {
    // fall through to the default
  }
  const fallback = path.join(os.homedir(), "second-brain");
  return fs.existsSync(fallback) ? fallback : null;
}

/** Local YYYY-MM-DD. Never UTC: a daily note has to match their day. */
export function today(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Local HH:MM, for capture timestamps. */
export function now(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return today(d);
}

export function dailyFile(vault, date = today()) {
  return path.join(vault, "daily", `${date}.md`);
}

/** Create today's note if it does not exist. Returns its path. */
export function ensureDaily(vault, date = today()) {
  const file = dailyFile(vault, date);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `# ${date}\n\n`, "utf8");
  }
  return file;
}

/** Append a timestamped line to today's note. The one capture door. */
export function appendDaily(vault, text, date = today()) {
  const file = ensureDaily(vault, date);
  fs.appendFileSync(file, `\n**${now()}** ${text}\n`, "utf8");
  return file;
}

/** First H1, or the filename if there isn't one. Bounded read, hooks are timed. */
export function titleOf(file) {
  try {
    const head = fs.readFileSync(file, "utf8").slice(0, 4000).split("\n");
    for (const line of head) {
      if (line.startsWith("# ")) return line.slice(2).trim();
    }
  } catch {
    // unreadable is not fatal in a hook
  }
  return path.basename(file, ".md");
}

/** Markdown files directly inside a vault folder. */
export function listNotes(vault, folder) {
  const dir = path.join(vault, folder);
  try {
    return fs
      .readdirSync(dir)
      // README.md files are folder scaffolding shipped by the template,
      // not the student's content. Counting them told a brand-new user they
      // had "1 deals" on install day.
      .filter(
        (f) =>
          f.endsWith(".md") &&
          !f.startsWith("_") &&
          f.toLowerCase() !== "readme.md"
      )
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

/** Read a vault file, empty string if missing. */
export function read(vault, rel) {
  try {
    return fs.readFileSync(path.join(vault, rel), "utf8");
  } catch {
    return "";
  }
}

/** Append one line to the ledger, the vault-wide activity trail. */
export function ledger(vault, line) {
  const file = path.join(vault, "LEDGER.md");
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "# LEDGER\n\nEvery change, newest at the bottom.\n", "utf8");
    }
    fs.appendFileSync(file, `- ${today()} ${now()} ${line}\n`, "utf8");
  } catch {
    // a hook must never break the session over a log write
  }
}
