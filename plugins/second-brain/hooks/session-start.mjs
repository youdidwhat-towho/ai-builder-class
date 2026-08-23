#!/usr/bin/env node
// SessionStart hook. The reason the vault feels alive instead of empty.
//
// Runs every time a Claude session opens and prints the student's own
// state into the context. Without this, a new vault is a folder tree
// that waits to be typed at. With it, the first thing they see is their
// own name, their own open work, and what they said yesterday.
//
// Must stay well under the 10s hook timeout and must never throw. A hook
// that crashes takes the session's first impression with it.

import fs from "node:fs";
import path from "node:path";
import {
  vaultPath,
  today,
  daysAgo,
  dailyFile,
  listNotes,
  titleOf,
  read,
} from "../lib/vault.mjs";

function main() {
  const vault = vaultPath();
  if (!vault) {
    console.log(
      "No second brain found yet. Run the installer, or tell Claude where your vault is."
    );
    return;
  }

  const out = [];
  const say = (s = "") => out.push(s);

  // Who they are. Written by the onboarding interview into MEMORY.md.
  const memory = read(vault, "MEMORY.md");
  // [ \t]* not \s*: \s matches newlines, so an empty "- name:" line
  // swallowed the line break and captured "- work:" as the person's name.
  const nameMatch = memory.match(/^[ \t]*[-*]?[ \t]*name:[ \t]*(\S.*)$/im);
  const name = nameMatch ? nameMatch[1].trim() : null;

  say("=== YOUR SECOND BRAIN ===");
  say(name ? `${greeting()}, ${name}. Today is ${today()}.` : `${greeting()}. Today is ${today()}.`);
  say();

  // Today's captures. This is the single capture door, so it is the
  // first thing that matters.
  const todayFile = dailyFile(vault, today());
  if (fs.existsSync(todayFile)) {
    const body = fs.readFileSync(todayFile, "utf8");
    const entries = body.split("\n").filter((l) => /^\*\*\d{2}:\d{2}\*\*/.test(l));
    if (entries.length) {
      say(`TODAY (${entries.length} capture${entries.length === 1 ? "" : "s"}):`);
      for (const e of entries.slice(-5)) say("  " + e.replace(/\*\*/g, ""));
    } else {
      say("TODAY: daily note is open and empty. Capture anything to start it.");
    }
  } else {
    say("TODAY: no daily note yet. Say 'capture this: ...' and one gets made.");
  }
  say();

  // Yesterday's close. This is what makes /pickup work, and saying it
  // out loud teaches the dependency without a lecture.
  const yFile = dailyFile(vault, daysAgo(1));
  if (fs.existsSync(yFile)) {
    const y = fs.readFileSync(yFile, "utf8");
    const tomorrow = y.match(/##+\s*Tomorrow\s*\n([\s\S]*?)(\n##|\s*$)/i);
    if (tomorrow) {
      say("YOU SAID YOU'D DO TODAY:");
      for (const line of tomorrow[1].trim().split("\n").slice(0, 4)) {
        if (line.trim()) say("  " + line.trim());
      }
      say();
    }
  }

  // Open work, counted not listed. A count is scannable, a list is noise.
  const counts = [
    ["deal", listNotes(vault, "deals").length],
    ["property", listNotes(vault, "properties").length],
    ["contact", listNotes(vault, "contacts").length],
  ].filter(([, n]) => n > 0);
  if (counts.length) {
    const plural = (word, n) =>
      n === 1 ? word : word === "property" ? "properties" : word + "s";
    say(
      "IN THE VAULT: " +
        counts.map(([k, n]) => `${n} ${plural(k, n)}`).join("  ·  ")
    );
    say();
  }

  // Connections the compiler found overnight. The payoff for reflection
  // running on a schedule instead of on demand.
  const conns = listNotes(vault, "connections")
    .map((f) => ({ f, m: fs.statSync(f).mtimeMs }))
    .sort((a, b) => b.m - a.m)
    .slice(0, 3);
  if (conns.length) {
    say("YOUR BRAIN CONNECTED THESE:");
    for (const c of conns) say("  · " + titleOf(c.f));
    say();
  }

  // Heartbeat health, in front of them rather than buried in a log.
  // A silent heartbeat is worse than none, so a stale one says so here.
  say(heartbeatLine(vault));

  console.log(out.join("\n"));
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

/** Reports staleness in plain words. Quiet failure is the enemy. */
function heartbeatLine(vault) {
  const beat = path.join(vault, ".heartbeat");
  try {
    const last = fs.statSync(beat).mtimeMs;
    const hours = (Date.now() - last) / 3_600_000;
    if (hours < 26) return "Heartbeat: running.";
    return `Heartbeat: LAST RAN ${Math.round(hours / 24)} day(s) AGO. It has stopped. Ask Claude to fix the heartbeat.`;
  } catch {
    return "Heartbeat: not running yet.";
  }
}

try {
  main();
} catch (err) {
  // Never let a context hook kill the session.
  console.log("Second brain context unavailable: " + err.message);
}
