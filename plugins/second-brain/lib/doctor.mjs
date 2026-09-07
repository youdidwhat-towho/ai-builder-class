#!/usr/bin/env node
// /doctor — checks every part of the second brain and says what to do.
//
// This is the support desk. A beginner who hits a problem has exactly one
// move: run this, read the red lines, do what they say. If that is not
// enough, they paste the output to Christopher, who can diagnose without a
// screen share.
//
// Every failing check must print a fix. A red line with no instruction is
// worse than no check at all, because it tells someone something is broken
// and leaves them stuck.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { vaultPath, today, dailyFile, CONFIG, backupState } from "../lib/vault.mjs";
import { readSettings, SETTINGS, TAG } from "../lib/settings.mjs";
import { scheduleExists, IS_WIN } from "../lib/platform.mjs";
import { loadIndex } from "../lib/search.mjs";

const KIT = path.join(os.homedir(), ".claude", "second-brain");
// The install is a plugin now, so the universal fix is to reinstall it and
// re-run setup. Keep this string in one place: every failing check prints it.
const REINSTALL = "/plugin install second-brain@ai-builder-class   then   /setup";

const results = [];
function ok(name, detail) {
  results.push({ state: "ok", name, detail });
}
function bad(name, detail, fix) {
  results.push({ state: "bad", name, detail, fix });
}
function warn(name, detail, fix) {
  results.push({ state: "warn", name, detail, fix });
}

function checkNode() {
  const major = Number(process.versions.node.split(".")[0]);
  if (major >= 18) ok("Node", `v${process.versions.node}`);
  else
    bad(
      "Node",
      `v${process.versions.node} is too old`,
      "Install Node 18 or newer from nodejs.org, then close and reopen your terminal."
    );
}

function checkVault() {
  const vault = vaultPath();
  if (!vault) {
    bad(
      "Vault",
      "no vault found",
      `Run:  ${REINSTALL}`
    );
    return null;
  }
  ok("Vault", vault);

  const daily = path.join(vault, "daily");
  if (fs.existsSync(daily)) ok("Daily folder", path.relative(vault, daily));
  else
    bad(
      "Daily folder",
      "missing",
      `Run:  ${REINSTALL}   (this never touches your notes)`
    );
  return vault;
}

function checkHooks() {
  let settings;
  try {
    settings = readSettings();
  } catch (err) {
    bad("Settings file", err.message, "Move the broken settings file aside, then run /setup again.");
    return;
  }

  const hooks = settings.hooks || {};
  // Two install routes wire hooks differently. The plugin route (recommended)
  // carries them in the plugin's own hooks.json and settings only enables the
  // plugin. The clone route writes tagged entries into settings.json. Either
  // one counts. Found 2026-09-07 when a correct plugin install reported its
  // greeting as missing.
  const viaPlugin = !!(settings.enabledPlugins || {})["second-brain@ai-builder-class"];
  const ours = (event) =>
    viaPlugin ? [true] : (hooks[event] || []).filter((g) => g._kit === TAG);

  if (ours("SessionStart").length)
    ok("Greeting on open", viaPlugin ? "wired by the plugin" : "SessionStart hook installed");
  else
    bad(
      "Greeting on open",
      "not installed, so your brain will not know your state",
      `Run:  ${REINSTALL}`
    );

  if (ours("PostToolUse").length) ok("Change log", viaPlugin ? "wired by the plugin" : "PostToolUse hook installed");
  else
    warn(
      "Change log",
      "not installed, so file changes are not being recorded",
      `Run:  ${REINSTALL}`
    );
}

function checkGuard() {
  // Presence is not protection. Run the guard the way Claude Code runs it and
  // make it refuse something it must refuse. A guard that exists but lets
  // "cat .env" through is worse than none, because everyone assumes it works.
  const guard = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "hooks", "guard.mjs");
  if (!fs.existsSync(guard)) {
    bad("Damage control", "guard.mjs is missing from the plugin", `Run:  ${REINSTALL}`);
    return;
  }
  const probe = JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command: "cat .env" } });
  const r = spawnSync(process.execPath, [guard], { input: probe, encoding: "utf8" });
  if (r.status === 2 && /BLOCKED/.test(r.stderr || "")) {
    const own = path.join(os.homedir(), ".claude", "second-brain-guard.json");
    ok("Damage control", fs.existsSync(own) ? "on, with your own patterns merged in" : "on: blocks deletes, secrets and shell files before they happen");
  } else {
    bad(
      "Damage control",
      `the guard did not block a protected read (exit ${r.status})`,
      `Run:  ${REINSTALL}   and if it still fails, send this screen to Christopher.`
    );
  }
}

function checkDisplay() {
  let settings;
  try {
    settings = readSettings();
  } catch {
    return; // already reported by checkHooks
  }
  const cmd = settings.statusLine?.command || "";
  if (!cmd) warn("Status bar", "not set, so nothing shows how full a session is", `Run:  ${REINSTALL}`);
  else if (/statusline\.mjs|second-brain/.test(cmd)) ok("Status bar", "the kit's, with checkpoint reminders at 20% and 40%");
  else ok("Status bar", "your own");
}

function checkSchedule(vault) {
  const beat = path.join(vault, ".heartbeat");
  const registered = scheduleExists("com.secondbrain.heartbeat");

  if (!registered) {
    bad(
      "Daily check-in",
      "not scheduled",
      IS_WIN
        ? `Run:  ${REINSTALL}\n     If it still fails, Windows may be blocking scheduled tasks. Send this screen to Christopher.`
        : `Run:  ${REINSTALL}`
    );
  } else if (!fs.existsSync(beat)) {
    warn(
      "Daily check-in",
      "scheduled but has not run yet",
      "Normal on install day. Check again tomorrow."
    );
  } else {
    const hours = (Date.now() - fs.statSync(beat).mtimeMs) / 3_600_000;
    if (hours < 26) ok("Daily check-in", `last ran ${Math.round(hours)}h ago`);
    else
      bad(
        "Daily check-in",
        `last ran ${Math.round(hours / 24)} days ago, it has stopped`,
        `Run:  ${REINSTALL}`
      );
  }
}

/** Reflection is what makes the vault get smarter instead of just bigger. */
function checkReflection(vault) {
  if (!scheduleExists("com.secondbrain.reflect")) {
    bad("Nightly reflection", "not scheduled", `Run:  ${REINSTALL}`);
    return;
  }
  const mark = path.join(vault, ".reflected");
  if (!fs.existsSync(mark)) {
    warn("Nightly reflection", "scheduled but has not run yet", "Normal on install day. Check again tomorrow.");
    return;
  }
  const hours = (Date.now() - fs.statSync(mark).mtimeMs) / 3_600_000;
  if (hours < 30) ok("Nightly reflection", `last ran ${Math.round(hours)}h ago`);
  else
    bad(
      "Nightly reflection",
      `last ran ${Math.round(hours / 24)} days ago, it has stopped`,
      `Run:  ${REINSTALL}`
    );
}

/**
 * Is there a copy of this vault anywhere but here?
 *
 * The one check whose failure a person cannot see for themselves. A vault
 * that stops pushing looks identical to one that pushes every night, right
 * up to the day the laptop dies.
 */
function checkBackup(vault) {
  if (!scheduleExists("com.secondbrain.backup")) {
    bad("Nightly backup", "not scheduled", `Run:  ${REINSTALL}`);
    return;
  }
  const s = backupState(vault);
  if (!s) {
    warn("Nightly backup", "scheduled but has not run yet", "Normal on install day. Check again tomorrow.");
    return;
  }
  const hours = (Date.now() - new Date(s.pushedAt || s.at).getTime()) / 3_600_000;
  if (s.state === "failed") {
    bad(
      "Nightly backup",
      `the last push failed: ${s.error || "unknown reason"}`,
      "Your notes are saved on this machine but not online. If the reason mentions login, " +
        "permission, or authentication, the GitHub connection needs redoing: send this screen to Christopher. " +
        "If it mentions the network, it will retry tonight on its own."
    );
  } else if (s.state === "local") {
    warn(
      "Nightly backup",
      "saved on this machine every night, but nowhere else",
      "Ask Christopher to connect an online copy (needs a free GitHub account). Until then, a lost laptop is a lost vault."
    );
  } else if (hours < 30) {
    ok("Nightly backup", `online copy is current, pushed ${Math.round(hours)}h ago`);
  } else {
    bad(
      "Nightly backup",
      `online copy is ${Math.round(hours / 24)} days old, the job has stopped`,
      `Run:  ${REINSTALL}   then check again tomorrow.`
    );
  }
}

function checkSearch(vault) {
  const index = loadIndex(vault);
  const n = index.entries?.length || 0;
  if (n > 0) ok("Search", `${n} pieces indexed`);
  else
    warn(
      "Search",
      "nothing indexed yet",
      "Normal if your vault is brand new. It indexes overnight, or ask Claude to reindex now."
    );
}

function checkNotes(vault) {
  const t = dailyFile(vault, today());
  if (fs.existsSync(t)) ok("Today's note", path.basename(t));
  else
    warn(
      "Today's note",
      "not created yet",
      'Say "capture this: testing my second brain" and it will appear.'
    );

  const boot = path.join(vault, "BOOTSTRAP.md");
  if (fs.existsSync(boot))
    warn(
      "Onboarding",
      "not finished yet",
      "Open Claude in your vault folder. It will interview you, then this goes away."
    );
  else ok("Onboarding", "done");
}

/**
 * Does the installed brain actually SAY anything?
 *
 * Every other check in this file asks whether something runs. Two clients
 * ran a hollow second brain for weeks and passed every one of them, because
 * a vault template with the instructions stripped out installs perfectly,
 * starts perfectly, and answers perfectly uselessly. Presence is not
 * substance, and only substance is what the user actually bought.
 *
 * So these check for content markers rather than files. Each one names a
 * capability the user was promised somewhere, and looks for the words that
 * deliver it.
 */
function checkSubstance(vault) {
  const claude = path.join(vault, "CLAUDE.md");
  if (!fs.existsSync(claude)) {
    bad("Instructions", "CLAUDE.md is missing", REINSTALL);
    return;
  }
  const text = fs.readFileSync(claude, "utf8");

  // Each entry: what the user was promised, and the phrase that proves the
  // instruction survived into their copy.
  const promises = [
    ["one capture door", /capture door|only capture/i],
    ["says which file it changed", /which file|tell me what you did/i],
    ["searches meaning, not filenames", /by meaning|search.*meaning/i],
    ["empty vs blocked", /empty and blocked|could not look/i],
    ["stamps what it touches", /last_touched/i],
    ["active vs archived memory", /archive/i],
    ["a maintenance habit", /maintain/i],
    ["a weekly correction loop", /week-review|week review/i],
    ["plain voice, no em dashes", /em dash/i],
    ["coaching callouts on", /callout/i],
  ];
  const missing = promises.filter(([, re]) => !re.test(text)).map(([label]) => label);

  if (!missing.length) {
    ok("Instructions", `all ${promises.length} rules present`);
  } else {
    bad(
      "Instructions",
      `${missing.length} of ${promises.length} missing: ${missing.join(", ")}`,
      "Your CLAUDE.md is missing rules it should have shipped with. Reinstalling never rewrites " +
        "CLAUDE.md, so open Claude in your vault and say: add the rules my CLAUDE.md is missing " +
        "from the kit's vault-template CLAUDE.md, without changing anything else in mine."
    );
  }

  // A brain that cannot be pruned rots on a schedule, so the folder and the
  // skills that use it are part of the promise, not extras.
  const archive = path.join(vault, "archive");
  if (fs.existsSync(archive)) ok("Archive", "passive memory available");
  else
    bad(
      "Archive",
      "no archive/ folder, so nothing can age out",
      "Everything will stay in active memory forever and searches get worse every month. " +
        REINSTALL
    );

  const templates = path.join(vault, "_templates");
  const n = fs.existsSync(templates)
    ? fs.readdirSync(templates).filter((f) => f.endsWith(".md")).length
    : 0;
  if (n) ok("Note templates", `${n} installed`);
  else
    bad(
      "Note templates",
      "none installed",
      "New notes will have no shape and nothing will carry a last_touched stamp. " + REINSTALL
    );
}

function main() {
  console.log("");
  console.log("  SECOND BRAIN CHECKUP");
  console.log("  " + "-".repeat(52));

  checkNode();
  const vault = checkVault();
  if (vault) {
    checkHooks();
    checkGuard();
    checkDisplay();
    checkSchedule(vault);
    checkReflection(vault);
    checkBackup(vault);
    checkSearch(vault);
    checkNotes(vault);
    checkSubstance(vault);
  }

  console.log("");
  for (const r of results) {
    const mark = r.state === "ok" ? "  OK  " : r.state === "warn" ? " WARN " : " FAIL ";
    console.log(`  [${mark}] ${r.name}: ${r.detail}`);
  }

  const broken = results.filter((r) => r.state !== "ok");
  console.log("");
  if (!broken.length) {
    console.log("  Everything is working.");
    console.log("");
    return;
  }

  console.log("  WHAT TO DO");
  console.log("  " + "-".repeat(52));
  for (const r of broken) {
    console.log(`\n  ${r.name}`);
    console.log(`     ${r.fix}`);
  }
  console.log("");
  console.log("  Still stuck? Copy everything above and send it to Christopher.");
  console.log("");
}

try {
  main();
} catch (err) {
  console.log("\n  The checkup itself failed: " + err.message);
  console.log("\n  Run:  " + REINSTALL + "\n");
}
