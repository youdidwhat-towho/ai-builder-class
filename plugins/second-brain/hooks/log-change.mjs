#!/usr/bin/env node
// PostToolUse hook. Writes one ledger line every time Claude changes a
// file in the vault.
//
// This is the deterministic half of the system. A rule in CLAUDE.md that
// says "log your changes" gets followed most of the time. A hook runs
// every time, including the times nobody is watching. That difference is
// the whole lesson, and it is why this ships turned on instead of as an
// example file somebody has to rename.

import fs from "node:fs";
import path from "node:path";
import { vaultPath, ledger } from "../lib/vault.mjs";

function main() {
  const vault = vaultPath();
  if (!vault) return;

  // Claude Code sends the tool payload as JSON on stdin.
  let payload = {};
  try {
    const raw = fs.readFileSync(0, "utf8");
    if (raw.trim()) payload = JSON.parse(raw);
  } catch {
    // No payload is fine, log what we can.
  }

  const input = payload.tool_input || {};
  const file = input.file_path || input.path || input.notebook_path;
  if (!file) return;

  // Only log changes inside the vault. Claude edits plenty of files
  // elsewhere and none of that belongs in their activity trail.
  const rel = path.relative(vault, file);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return;

  const tool = payload.tool_name || "edit";
  const verb = tool === "Write" ? "created or replaced" : "edited";
  ledger(vault, `${verb} ${rel}`);
}

try {
  main();
} catch {
  // A logging hook must never block a write.
}
