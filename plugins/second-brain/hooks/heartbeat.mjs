#!/usr/bin/env node
// Heartbeat. Runs on a schedule and writes into the student's own daily
// note, where they will see it.
//
// The design constraint that shaped this: a background job on somebody
// else's laptop that fails quietly is worse than no background job at
// all. It teaches them to trust something that stopped working. So the
// heartbeat's output is visible by construction. It lands in the daily
// note they already read, and its absence is a gap they will notice.
//
// It does not need the network, an API key, or a model. It reads their
// vault and tells them one true thing about it.
//
// Usage: node heartbeat.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  vaultPath,
  today,
  daysAgo,
  dailyFile,
  ensureDaily,
  appendDaily,
  listNotes,
} from "../lib/vault.mjs";

function main() {
  const vault = vaultPath();
  if (!vault) {
    console.error("heartbeat: no vault configured");
    process.exit(1);
  }

  ensureDaily(vault);

  // Only speak once a day. A scheduler that fires hourly should not
  // produce twenty identical lines.
  const file = dailyFile(vault);
  const body = fs.readFileSync(file, "utf8");
  if (body.includes("<!-- heartbeat -->")) {
    stamp(vault);
    console.log("heartbeat: already spoke today");
    return;
  }

  const nudge = pickNudge(vault);
  fs.appendFileSync(file, `\n<!-- heartbeat -->\n**Your brain noticed:** ${nudge}\n`, "utf8");
  stamp(vault);
  console.log("heartbeat: " + nudge);
}

/**
 * One observation, chosen by what is actually true of their vault.
 * Ordered so the most useful thing wins rather than the first match.
 */
function pickNudge(vault) {
  // A vault installed today has no history, and telling a brand-new user
  // that "7 of the last 7 days have no daily note" is both true and a
  // terrible first thing to say. Welcome them instead.
  if (ageInDays(vault) < 2) {
    return "this is day one. Capture anything at all today, and tomorrow I will have something to tell you.";
  }

  // Did yesterday get closed out? This is the habit the whole loop rests on.
  const y = dailyFile(vault, daysAgo(1));
  if (fs.existsSync(y)) {
    const text = fs.readFileSync(y, "utf8");
    if (!/##+\s*Tomorrow/i.test(text)) {
      return "yesterday's note never got a wrap up, so there was nothing for this morning to pick up. Try `wrap up` tonight.";
    }
  }

  // Silence is the failure mode for capture. Name it plainly.
  let quiet = 0;
  for (let i = 1; i <= 7; i++) {
    if (!fs.existsSync(dailyFile(vault, daysAgo(i)))) quiet++;
  }
  if (quiet >= 3) {
    return `${quiet} of the last 7 days have no daily note. The system only knows what you tell it once.`;
  }

  // Something captured but never filed.
  const deals = listNotes(vault, "deals").length;
  if (deals === 0) {
    return "there are no deals in the vault yet. Say `deal intake` and paste anything messy you have.";
  }

  // Stale work is the thing a human brain drops and this one should not.
  const stale = listNotes(vault, "deals")
    .map((f) => ({ f, age: (Date.now() - fs.statSync(f).mtimeMs) / 86_400_000 }))
    .filter((d) => d.age > 14)
    .sort((a, b) => b.age - a.age);
  if (stale.length) {
    const name = path.basename(stale[0].f, ".md");
    return `${name} hasn't been touched in ${Math.round(stale[0].age)} days. Still live, or dead?`;
  }

  return `${deals} deal${deals === 1 ? "" : "s"} in the vault and everything touched recently. Nothing is rotting.`;
}

/** How long this vault has existed, from the install stamp. */
function ageInDays(vault) {
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(os.homedir(), ".claude", "second-brain.json"), "utf8")
    );
    if (cfg.installed) {
      return (Date.now() - new Date(cfg.installed).getTime()) / 86_400_000;
    }
  } catch {
    // fall through
  }
  return Infinity;
}

/** Proof of life the SessionStart hook reads back to them. */
function stamp(vault) {
  try {
    fs.writeFileSync(path.join(vault, ".heartbeat"), new Date().toISOString(), "utf8");
  } catch {
    // non-fatal
  }
}

try {
  main();
} catch (err) {
  console.error("heartbeat failed: " + err.message);
  process.exit(1);
}
