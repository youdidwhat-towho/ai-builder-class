// Safe settings.json surgery.
//
// A student may already have hooks, permissions, or a model set. Blowing
// that away to install ours is the kind of thing that makes people stop
// trusting an installer. So: read, merge, back up, write. Every one of
// our hooks is tagged, which is what makes the install idempotent and the
// uninstall clean.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const TAG = "second-brain-kit";
export const SETTINGS = path.join(os.homedir(), ".claude", "settings.json");

export function readSettings(file = SETTINGS) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch (err) {
    if (err.code === "ENOENT") return {};
    // A settings file that exists but does not parse is the one case where
    // guessing is worse than stopping. Overwriting it would destroy work.
    throw new Error(
      `${file} exists but is not valid JSON. Fix or move it, then re-run. (${err.message})`
    );
  }
}

export function backup(file = SETTINGS) {
  if (!fs.existsSync(file)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = `${file}.backup-${stamp}`;
  fs.copyFileSync(file, dest);
  return dest;
}

/**
 * Add our hooks without disturbing theirs.
 *
 * Ours carry `_kit: TAG`, so re-running the installer replaces our entries
 * in place instead of stacking duplicates. Anything untagged is theirs and
 * is never touched.
 */
export function mergeHooks(settings, ours) {
  const out = { ...settings };
  out.hooks = { ...(settings.hooks || {}) };

  for (const [event, groups] of Object.entries(ours)) {
    const existing = (out.hooks[event] || []).filter((g) => g._kit !== TAG);
    const tagged = groups.map((g) => ({ ...g, _kit: TAG }));
    out.hooks[event] = [...existing, ...tagged];
  }
  return out;
}

export function removeHooks(settings) {
  const out = { ...settings };
  out.hooks = { ...(settings.hooks || {}) };
  for (const event of Object.keys(out.hooks)) {
    out.hooks[event] = (out.hooks[event] || []).filter((g) => g._kit !== TAG);
    if (!out.hooks[event].length) delete out.hooks[event];
  }
  if (!Object.keys(out.hooks).length) delete out.hooks;
  return out;
}

export function writeSettings(settings, file = SETTINGS) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Write to a temp file and rename. A half-written settings.json breaks
  // every future session, and an interrupted install should not be able
  // to cause that.
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(settings, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, file);
}

/** The hook set this kit installs. Paths are filled in by the installer. */
export function hookSpec(hooksDir) {
  const node = (script) => `node "${path.join(hooksDir, script)}"`;
  return {
    SessionStart: [
      { hooks: [{ type: "command", command: node("session-start.mjs") }] },
    ],
    PostToolUse: [
      {
        matcher: "Edit|MultiEdit|Write|NotebookEdit",
        hooks: [{ type: "command", command: node("log-change.mjs") }],
      },
    ],
    // The voice rules in CLAUDE.md are a suggestion. This makes them a gate.
    Stop: [{ hooks: [{ type: "command", command: node("voice-guard.mjs") }] }],
  };
}
