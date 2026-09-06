#!/usr/bin/env node
// Status bar. The one line at the bottom of every Claude session.
//
// Context fill is the number a beginner most needs and least understands.
// A session that quietly runs out of room loses detail without saying so.
// So the bar turns that number into a mood, and the mood turns into a
// reminder at two lines that matter:
//   20%  first checkpoint reminder. Still light, good moment to save.
//   40%  second, firmer. Checkpoint now, then keep going.
//   60%  the single alarm state. tldr and start fresh.
//
// Node rather than bash because a Windows machine has neither bash nor jq.
// Reads the JSON Claude Code pipes in, prints one line, never throws.

import fs from "node:fs";

let input = "";
try {
  input = fs.readFileSync(0, "utf8");
} catch {
  // nothing on stdin, print the resting bar
}

let d = {};
try {
  d = JSON.parse(input || "{}");
} catch {
  d = {};
}

const R = "\x1b[0m", B = "\x1b[1m";
const C = {
  white: "\x1b[97m", cyan: "\x1b[96m", green: "\x1b[92m", yellow: "\x1b[93m",
  orange: "\x1b[38;5;208m", red: "\x1b[91m", magenta: "\x1b[95m", blue: "\x1b[94m", gray: "\x1b[90m",
};
const SEP = `${C.gray}  ${R}`;

const model = d.model?.display_name || "Claude";
const pctRaw = d.context_window?.used_percentage;
const pct = pctRaw == null ? null : Math.round(Number(pctRaw));
const tin = Number(d.context_window?.total_input_tokens || 0);
const tout = Number(d.context_window?.total_output_tokens || 0);
const cwd = d.workspace?.current_dir || d.cwd || "";
const ms = d.cost?.total_duration_ms;

function mood(p) {
  if (p == null) return "🚀 on the pad, fueled and ready";
  if (p >= 60) return "🚨 past 60, say tldr and start fresh";
  if (p >= 50) return "🛬 getting full, tldr soon";
  if (p >= 40) return "⏳ 40%, say checkpoint now, then keep going";
  if (p >= 30) return "🏔️ heavy now, checkpoint if you have not";
  if (p >= 20) return "💾 20%, good moment to say checkpoint";
  if (p >= 12) return "💪 full throttle, locked in";
  if (p >= 6) return "⚡ off the ground and climbing";
  return "🚀 on the pad, fueled and ready";
}
function tone(p) {
  if (p >= 60) return C.red;
  if (p >= 40) return C.orange;
  if (p >= 20) return C.yellow;
  return C.green;
}
function bar(p) {
  const filled = Math.max(0, Math.min(10, Math.floor(p / 10)));
  return `${tone(p)}${"█".repeat(filled)}${R}${C.gray}${"░".repeat(10 - filled)}${R}`;
}

const parts = [];
parts.push(`${B}${C.yellow}${mood(pct)}${R}${C.gray} w/ ${R}${C.magenta}${model}${R}`);
if (cwd) parts.push(`${C.blue}📁 ${cwd.replace(/[\\/]+$/, "").split(/[\\/]/).pop()}${R}`);
parts.push(
  pct == null
    ? `${C.gray}ctx [░░░░░░░░░░] --%${R}`
    : `${C.gray}ctx ${R}[${bar(pct)}${C.gray}]${R} ${tone(pct)}${pct}%${R}`
);
// Rough session cost at list prices, so the number means something even on a flat plan.
const cost = (tin / 1e6) * 3 + (tout / 1e6) * 15;
parts.push(`${C.gray}~$${R}${C.cyan}${cost.toFixed(4)}${R}`);
if (ms != null) {
  const s = Math.floor(Number(ms) / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const t = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  parts.push(`${C.yellow}⏱ ${t}${R}`);
}
process.stdout.write(parts.join(SEP));
