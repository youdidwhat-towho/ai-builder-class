#!/usr/bin/env node
// Reflection. Runs nightly on a schedule, not on demand.
//
// This is the part that makes a second brain get smarter instead of just
// getting bigger. It reads the last stretch of daily notes, pulls out the
// things that repeat, and writes them where the SessionStart hook will
// surface them tomorrow morning.
//
// Deliberately dumb about language. No model call, no API key, no network.
// It counts and it links. A student's brain has to keep working when they
// are offline, out of credits, or three months past caring.
//
// Usage: node reflect.mjs [--days 7]

import fs from "node:fs";
import path from "node:path";
import { vaultPath, today, daysAgo, dailyFile, ledger } from "../lib/vault.mjs";

const STOP = new Set(
  ("the a an and or but if then than that this these those with without for from into onto " +
   "of to in on at by is are was were be been being do does did done have has had will would " +
   "can could should may might must i me my we our you your it its they them their he she " +
   "not no yes so just really very much more most some any all one two out up down about " +
   "got get gets going went said says say like know think need want wants wanted today " +
   "tomorrow yesterday am pm capture note notes daily also back over after before still now " +
   "new next last work works worked working talk talks talked call calls called looked looks " +
   "thing things stuff make made makes take takes took give gives gave keep keeps kept")
    .split(/\s+/)
);

/**
 * Single words plus two-word phrases.
 *
 * "west valley" is one theme. Counting the halves separately produced a
 * list where the same idea appeared three times and the real subject was
 * never stated.
 */
function terms(text) {
  const out = [];
  // Phrases are built per line. Spanning lines invented themes like
  // "seller marquis" by gluing the end of one capture to the start of the
  // next, which is a phrase nobody ever wrote.
  for (const line of text.split("\n")) {
    const words = tokens(line);
    out.push(...words);
    for (let i = 0; i < words.length - 1; i++) {
      out.push(words[i] + " " + words[i + 1]);
    }
  }
  return out;
}

function tokens(text) {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")      // code blocks are not themes
    .replace(/https?:\/\/\S+/g, " ")      // neither are URLs
    .replace(/[^a-z0-9'\- ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function main() {
  const vault = vaultPath();
  if (!vault) {
    console.error("reflect: no vault configured");
    process.exit(1);
  }

  const argDays = process.argv.indexOf("--days");
  const days = argDays > -1 ? Number(process.argv[argDays + 1]) || 7 : 7;

  // Gather the window.
  const notes = [];
  for (let i = 0; i < days; i++) {
    const f = dailyFile(vault, daysAgo(i));
    if (fs.existsSync(f)) {
      notes.push({ date: daysAgo(i), text: fs.readFileSync(f, "utf8") });
    }
  }
  if (notes.length < 2) {
    console.log("reflect: not enough daily notes yet, nothing to connect");
    touchHeartbeatSibling(vault);
    return;
  }

  // Count terms, and track which days each one showed up on. A word that
  // appears ten times in one note is a rant. A word that appears on four
  // separate days is a theme. Only the second kind is worth surfacing.
  const seenOn = new Map();
  for (const n of notes) {
    for (const term of new Set(terms(n.text))) {
      if (!seenOn.has(term)) seenOn.set(term, new Set());
      seenOn.get(term).add(n.date);
    }
  }

  let themes = [...seenOn.entries()]
    .map(([word, dates]) => ({ word, days: dates.size }))
    .filter((t) => t.days >= 3)
    .sort((a, b) => b.days - a.days || b.word.length - a.word.length);

  // Drop a single word when a phrase containing it is just as common.
  // Otherwise "west valley" reports as three separate themes: the phrase,
  // "west", and "valley", which reads like the thing is broken.
  const phrases = themes.filter((t) => t.word.includes(" "));
  themes = themes.filter(
    (t) =>
      t.word.includes(" ") ||
      !phrases.some((p) => p.word.split(" ").includes(t.word) && p.days >= t.days)
  );
  themes = themes.slice(0, 6);

  if (!themes.length) {
    console.log("reflect: no repeated themes across days yet");
    touchHeartbeatSibling(vault);
    return;
  }

  // Write one connection note. Overwrite today's rather than piling up,
  // so a daily schedule does not create 365 files a year.
  const dir = path.join(vault, "connections");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${today()}-themes.md`);

  const lines = [
    "---",
    "type: connection",
    `generated: ${today()}`,
    `window_days: ${days}`,
    "---",
    "",
    `# What kept coming up, last ${days} days`,
    "",
    `Across ${notes.length} daily note${notes.length === 1 ? "" : "s"}.`,
    "",
  ];
  for (const t of themes) {
    lines.push(`- **${t.word}** came up on ${t.days} different days`);
  }
  lines.push(
    "",
    "Ask your second brain: *\"what did I say about " + themes[0].word + "?\"*",
    ""
  );

  fs.writeFileSync(out, lines.join("\n"), "utf8");
  ledger(vault, `reflection wrote connections/${path.basename(out)}`);
  console.log(`reflect: wrote ${out}`);
  touchHeartbeatSibling(vault);
}

/** Reflection running is itself proof the scheduler is alive. */
function touchHeartbeatSibling(vault) {
  try {
    fs.writeFileSync(path.join(vault, ".reflected"), new Date().toISOString(), "utf8");
  } catch {
    // non-fatal
  }
}

try {
  main();
} catch (err) {
  console.error("reflect failed: " + err.message);
  process.exit(1);
}
