#!/usr/bin/env node
// Voice guard. A Stop hook that refuses to let a reply end while it still
// reads like a machine wrote it.
//
// The rules live in the vault's CLAUDE.md. This is the part that makes them
// stick, because a rule in a file is a suggestion and a model drifts back to
// its defaults whenever it is doing something hard. The original, in
// Python, drifted six documented times as a reminder before it became a
// gate. Here it is a gate from day one.
//
// What it checks in the last reply's prose (code, inline code and quoted
// lines are stripped first, so quoting a note that contains an em dash
// does not trip it):
//   - em dashes
//   - the short list of phrases nobody says out loud
//
// What it never does: loop. When Claude is already re-running because of
// this hook, it lets the turn through. Worst case is one rewrite per turn.
// Any internal error fails open. A broken linter must not wedge a session.
//
// Node, not Python, because the kit has to run on a Windows machine that
// has never seen python3.

import fs from "node:fs";
import { pathToFileURL } from "node:url";

const EM_DASH = "—";

const CLICHES = [
  /\bcertainly\b/i,
  /\bgreat question\b/i,
  /\bi'?d be happy to\b/i,
  /\bas an ai\b/i,
  /\babsolutely\b/i,
  /\byou'?re absolutely right\b/i,
  /\bi apologize for the confusion\b/i,
  /\blet me know if you'?d like\b/i,
];

/** Remove what was quoted rather than written, so only prose is linted. */
function stripQuoted(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "")
    .replace(/`[^`\n]*`/g, "")
    .replace(/^\s*>.*$/gm, "");
}

/** Text of the most recent assistant message in the JSONL transcript. */
function lastAssistantText(transcriptPath) {
  let lines;
  try {
    lines = fs.readFileSync(transcriptPath, "utf8").split("\n");
  } catch {
    return "";
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    const raw = lines[i].trim();
    if (!raw) continue;
    let entry;
    try {
      entry = JSON.parse(raw);
    } catch {
      continue;
    }
    if (entry.type !== "assistant") continue;
    const content = entry.message?.content ?? [];
    if (typeof content === "string") return content;
    const text = content
      .filter((b) => b && b.type === "text")
      .map((b) => b.text || "")
      .join("")
      .trim();
    if (text) return text;
  }
  return "";
}

export function lint(text) {
  const prose = stripQuoted(text);
  const problems = [];

  const dashes = prose.split(EM_DASH).length - 1;
  if (dashes) {
    const samples = [];
    let from = 0;
    while (samples.length < 3) {
      const at = prose.indexOf(EM_DASH, from);
      if (at < 0) break;
      samples.push("..." + prose.slice(Math.max(0, at - 45), at + 46).replace(/\n/g, " ").trim() + "...");
      from = at + 1;
    }
    problems.push(`${dashes} em dash(es). Offending spans:\n  ` + samples.join("\n  "));
  }

  const found = [...new Set(CLICHES.flatMap((re) => (prose.match(re) || []).map((m) => m.toLowerCase())))].sort();
  if (found.length) problems.push("Banned cliches: " + found.join(", "));

  return problems;
}

function main() {
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return; // fail open
  }
  if (payload.stop_hook_active) return; // already re-running, never loop

  const text = lastAssistantText(payload.transcript_path || "");
  if (!text) return;

  const problems = lint(text);
  if (!problems.length) return;

  console.log(
    JSON.stringify({
      decision: "block",
      reason: "Voice fix needed, then reissue:\n  " + problems.join("\n  "),
    })
  );
}

// Only run when executed directly. Importing (tests) must never lint anything.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch {
    // fail open
  }
}
