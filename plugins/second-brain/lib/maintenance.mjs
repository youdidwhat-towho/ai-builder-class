// Maintenance. The half of a second brain that decides whether it still
// works in month six.
//
// The failure mode this exists to prevent, in the words of the person who
// named it: people set up a second brain three months ago when it was hot,
// and now their vault is full of obsolete stale files. Nothing rots on
// day one. It rots on a timer, and the timer starts the day you install.
//
// Two ideas do the work here.
//
// ACTIVE vs PASSIVE MEMORY. Archiving is not deletion. It is demotion out
// of the default retrieval path. "What am I working on" should search
// active memory only. "Go through everything I have ever written" should
// search all of it. A vault with no such split has exactly one retrieval
// mode, and it gets worse every week it grows.
//
// LAST TOUCH AS THE SIGNAL. Not last edited. Modification time lies:
// a git checkout, a sync, a bulk rename, any script that walks the tree
// resets it on thousands of files at once and every one of them looks
// freshly worked. So we prefer an explicit `last_touched:` in frontmatter
// and fall back to mtime only when there is nothing better, and we say
// which one we used.
//
// Nothing in here moves a file. It reports. The moving is a decision, and
// decisions belong to the human.

import fs from "node:fs";
import path from "node:path";
import { listNotes } from "./vault.mjs";

/** Folders that hold the user's own thinking and can therefore go stale. */
export const CURATED = [
  "deals",
  "contacts",
  "properties",
  "decisions",
  "operations",
  "reference",
];

/**
 * Folders that must never be pruned, and why.
 *
 * `daily/` is the capture log. A dated note is not stale when it stops
 * being touched, it is finished. Pruning the daily log would be pruning
 * the record of what happened, which is the one thing a second brain
 * exists to keep.
 *
 * `connections/` is written by the reflection pass, not by the user.
 * `archive/` is already passive.
 */
export const NEVER_PRUNE = ["daily", "connections", "archive"];

const DAY = 86_400_000;

/** Read `last_touched:` out of frontmatter. Null when absent. */
function declaredTouch(file) {
  try {
    const head = fs.readFileSync(file, "utf8").slice(0, 800);
    const m = head.match(/^last_touched:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    if (!m) return null;
    const t = Date.parse(m[1]);
    return Number.isNaN(t) ? null : t;
  } catch {
    return null;
  }
}

/**
 * Age of one note in days, plus how we know.
 *
 * `basis` is part of the return value on purpose. A number without its
 * provenance invites the reader to trust it more than it deserves, and
 * mtime does not deserve much.
 */
export function ageOf(file) {
  const declared = declaredTouch(file);
  if (declared !== null) {
    return { days: (Date.now() - declared) / DAY, basis: "last_touched" };
  }
  try {
    return { days: (Date.now() - fs.statSync(file).mtimeMs) / DAY, basis: "mtime" };
  } catch {
    return { days: 0, basis: "unknown" };
  }
}

/**
 * Everything in the curated folders, oldest first, with age and basis.
 * `thresholdDays` only filters; it does not decide anything.
 */
export function survey(vault, thresholdDays = 30) {
  const out = [];
  for (const folder of CURATED) {
    for (const file of listNotes(vault, folder)) {
      const { days, basis } = ageOf(file);
      out.push({
        file,
        folder,
        name: path.basename(file, ".md"),
        days: Math.round(days),
        basis,
        stale: days >= thresholdDays,
      });
    }
  }
  return out.sort((a, b) => b.days - a.days);
}

/**
 * How much of this vault's age signal is guesswork.
 *
 * When most notes fall back to mtime, a staleness report is a report about
 * the filesystem rather than about the user's work, and it should say so
 * out loud instead of quietly presenting the number.
 */
export function signalQuality(notes) {
  const total = notes.length;
  if (!total) return { total: 0, declared: 0, ratio: 1, trustworthy: true };
  const declared = notes.filter((n) => n.basis === "last_touched").length;
  const ratio = declared / total;
  return { total, declared, ratio, trustworthy: ratio >= 0.5 };
}

/** Days since the last completed maintenance pass. Infinity if never. */
export function daysSinceLastPass(vault) {
  try {
    const stamp = fs.readFileSync(path.join(vault, ".maintenance"), "utf8").trim();
    const t = Date.parse(stamp);
    if (Number.isNaN(t)) return Infinity;
    return (Date.now() - t) / DAY;
  } catch {
    return Infinity;
  }
}

/** Record that a pass finished. Called after the user acts, never before. */
export function stampPass(vault) {
  try {
    fs.writeFileSync(path.join(vault, ".maintenance"), new Date().toISOString(), "utf8");
  } catch {
    // a stamp that fails to write must not break the pass that succeeded
  }
}

/**
 * Is a pass due? Default cadence is 14 days.
 *
 * A brand-new vault is never due. Telling somebody on day three that their
 * maintenance is overdue teaches them the prompt is noise, and after that
 * they will not read it on day ninety when it matters.
 */
export function passDue(vault, cadenceDays = 14, vaultAgeDays = Infinity) {
  if (vaultAgeDays < cadenceDays) return false;
  return daysSinceLastPass(vault) >= cadenceDays;
}
