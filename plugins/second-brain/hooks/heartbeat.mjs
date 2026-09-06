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
  backupState,
} from "../lib/vault.mjs";
import { survey, signalQuality, passDue, daysSinceLastPass } from "../lib/maintenance.mjs";
import { scheduleExists } from "../lib/platform.mjs";

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

  // A backup that failed outranks every habit nudge. Losing the vault
  // makes the habits moot, and a push that fails once usually keeps
  // failing until a human looks.
  const backup = backupNudge(vault);
  if (backup) return backup;

  // Did yesterday get closed out? This is the habit the whole loop rests on.
  // `wrap up` writes a Tomorrow section into the day's note; `tldr` writes
  // its own dated note beside it with a Handoff. Either one counts, because
  // either one gives tomorrow something to pick up.
  const y = dailyFile(vault, daysAgo(1));
  if (fs.existsSync(y) && !wrappedUp(vault, daysAgo(1))) {
    return "yesterday's note never got a wrap up, so there was nothing for this morning to pick up. Try `wrap up` tonight.";
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
  const projects = listNotes(vault, "projects").length;
  if (projects === 0) {
    return "there are no projects in the vault yet. Say `intake this` and paste anything messy you have.";
  }

  // The maintenance pass. This outranks any single stale note, because a
  // vault that has never been pruned will have dozens of them and naming
  // one at a time is a worse answer than naming the habit.
  const notes = survey(vault, 30);
  const overdue = notes.filter((n) => n.stale);
  if (passDue(vault, 14, ageInDays(vault)) && overdue.length >= 3) {
    const since = daysSinceLastPass(vault);
    const when = since === Infinity ? "never been run" : `last run ${Math.round(since)} days ago`;
    return `${overdue.length} notes have gone quiet and maintenance has ${when}. Say \`maintain\` and I will show you the list.`;
  }

  // A vault where almost nothing carries last_touched is a vault whose age
  // numbers are really filesystem numbers. Say that once, plainly, rather
  // than reporting confident staleness built on a signal that lies.
  const q = signalQuality(notes);
  if (q.total >= 20 && !q.trustworthy) {
    return `only ${q.declared} of ${q.total} notes record when they were last worked, so I am guessing at what is current from file dates. Ask me to stamp them and the next check gets honest.`;
  }

  // Stale work is the thing a human brain drops and this one should not.
  if (overdue.length) {
    const worst = overdue[0];
    const hedge = worst.basis === "mtime" ? " (going by the file date)" : "";
    return `${worst.name} hasn't been touched in ${worst.days} days${hedge}. Still live, or dead?`;
  }

  return `${projects} project${projects === 1 ? "" : "s"} in the vault and everything touched recently. Nothing is rotting.`;
}

/**
 * The backup's voice in the morning note.
 *
 * Failed: every day until fixed. Stopped: every day until fixed. No online
 * copy at all: once a week, because a laptop-only vault is a real risk but
 * a daily nag about it is how people learn to skip the check-in.
 */
function backupNudge(vault) {
  const s = backupState(vault);
  const days = (iso) => (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (!s) {
    // Never ran. Only worth saying if the job is actually registered; a vault
    // that backs itself up some other way (or not at all, by choice) should
    // not hear about a job it never had. /doctor still reports the gap.
    if (scheduleExists("com.secondbrain.backup") && ageInDays(vault) >= 3) {
      return "the nightly backup has never run. Say `/doctor` and it will say why.";
    }
    return null;
  }
  if (s.state === "failed") {
    return `last night's backup did not reach the online copy (${s.error || "unknown reason"}). Your notes are only on this machine until that is fixed. Say \`/doctor\`.`;
  }
  if (s.state === "pushed" && days(s.pushedAt || s.at) > 3) {
    return `the online backup is ${Math.round(days(s.pushedAt || s.at))} days old, so the nightly job has stopped. Say \`/doctor\`.`;
  }
  if (s.state === "local" && ageInDays(vault) >= 3 && Math.floor(ageInDays(vault)) % 7 === 0) {
    return "your notes are saved every night, but only on this laptop. Nothing is online yet. A lost or dead machine is a lost vault. Ask Christopher to connect the backup.";
  }
  return null;
}

/** Was this day closed out by `wrap up` or by a `tldr` note sitting beside it? */
function wrappedUp(vault, date) {
  const dir = path.join(vault, "daily");
  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.startsWith(date) && f.endsWith(".md"));
  } catch {
    return false;
  }
  return files.some((f) => {
    try {
      return /^##+\s*(Tomorrow|Handoff)\b/im.test(fs.readFileSync(path.join(dir, f), "utf8"));
    } catch {
      return false;
    }
  });
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
