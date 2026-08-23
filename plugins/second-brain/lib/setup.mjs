#!/usr/bin/env node
/*
 * First-run setup. Everything the plugin system cannot do for us.
 *
 * Installing the plugin gets the hooks, commands, and skills in place.
 * Three things still need a real process:
 *
 *   1. Creating the vault folder and its starter contents
 *   2. Registering the daily jobs (launchd on Mac, Task Scheduler on Windows)
 *   3. Installing the local embedding model for search
 *
 * Safe to run again. Re-running is the documented fix for almost any
 * problem, so it must never touch a note the student wrote.
 *
 * Usage: node setup.mjs [vault-path]
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN = path.dirname(HERE);
const CONFIG = path.join(os.homedir(), ".claude", "second-brain.json");

const steps = [];
let hardFail = false;

function report(name, state, detail) {
  const mark = state === "ok" ? "  OK  " : state === "warn" ? " WARN " : " FAIL ";
  console.log(`  [${mark}] ${name}: ${detail}`);
  steps.push({ name, state, detail });
  if (state === "fail") hardFail = true;
}

/** Copy without clobbering. This is what makes re-running safe. */
function copyTree(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, e.name);
    const to = path.join(dest, e.name);
    if (e.isDirectory()) n += copyTree(from, to);
    else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
      n++;
    }
  }
  return n;
}

async function main() {
  console.log("");
  console.log("  SETTING UP YOUR SECOND BRAIN");
  console.log("  " + "=".repeat(52));
  console.log("");

  // ---- Node version ----------------------------------------------------
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 18) {
    report("Node", "fail", `v${process.versions.node} is too old, needs 18 or newer`);
    return finish(null);
  }
  report("Node", "ok", `v${process.versions.node}`);

  // ---- Vault -----------------------------------------------------------
  const requested = process.argv[2];
  const vault = path.resolve(
    (requested || path.join(os.homedir(), "second-brain")).replace(/^~(?=$|[/\\])/, os.homedir())
  );

  try {
    fs.mkdirSync(vault, { recursive: true });
    const added = copyTree(path.join(PLUGIN, "vault-template"), vault);
    fs.writeFileSync(
      CONFIG,
      JSON.stringify({ vault, installed: new Date().toISOString() }, null, 2)
    );
    report("Vault", "ok", `${vault}${added ? ` (${added} starter files)` : " (already set up)"}`);
  } catch (err) {
    report("Vault", "fail", err.message);
    return finish(null);
  }

  // ---- Today's note ------------------------------------------------------
  try {
    const { ensureDaily } = await import(path.join(HERE, "vault.mjs"));
    ensureDaily(vault);
    report("Today's note", "ok", "created");
  } catch (err) {
    report("Today's note", "warn", err.message);
  }

  // ---- Daily jobs --------------------------------------------------------
  try {
    const { scheduleDaily } = await import(path.join(HERE, "platform.mjs"));
    const beat = scheduleDaily({
      label: "com.secondbrain.heartbeat",
      scriptPath: path.join(PLUGIN, "hooks", "heartbeat.mjs"),
      hour: 7,
      minute: 30,
    });
    const reflect = scheduleDaily({
      label: "com.secondbrain.reflect",
      scriptPath: path.join(PLUGIN, "hooks", "reflect.mjs"),
      hour: 22,
      minute: 0,
    });

    if (beat.ok && reflect.ok) report("Daily jobs", "ok", "7:30am check-in, 10pm reflection");
    else {
      // Not fatal. Everything else works without a scheduler, and a
      // student whose machine refuses scheduled tasks should still end up
      // with a functioning second brain plus a clear message.
      report(
        "Daily jobs",
        "warn",
        `could not schedule (${beat.detail || reflect.detail}). Your brain still works, it just will not check in on its own.`
      );
    }
  } catch (err) {
    report("Daily jobs", "warn", err.message);
  }

  // ---- Desktop icon -------------------------------------------------
  try {
    const { createLauncher, hasWindowsTerminal } = await import(path.join(HERE, "launcher.mjs"));
    const res = createLauncher(vault);
    if (res.ok) {
      report("Desktop icon", "ok", `"${path.basename(res.file)}" on your Desktop`);
      if (process.platform === "win32" && !hasWindowsTerminal()) {
        report("Windows Terminal", "warn", res.note);
      }
    } else {
      report("Desktop icon", "warn", res.note);
    }
  } catch (err) {
    report("Desktop icon", "warn", err.message);
  }

  // ---- Search ------------------------------------------------------------
  try {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    fs.writeFileSync(
      path.join(PLUGIN, "package.json"),
      JSON.stringify({ name: "second-brain", private: true, type: "module" }, null, 2)
    );
    console.log("         installing search, this takes a minute the first time ...");
    execFileSync(npm, ["install", "--silent", "--no-audit", "--no-fund", "@huggingface/transformers"], {
      cwd: PLUGIN,
      stdio: "pipe",
    });
    report("Search", "ok", "installed");
  } catch (err) {
    report(
      "Search",
      "warn",
      "could not install. Everything else works. Say 'set up search' later to retry."
    );
  }

  finish(vault);
}

function finish(vault) {
  console.log("");
  console.log("  " + "=".repeat(52));
  if (hardFail) {
    console.log("  Setup did not finish. Copy this screen and send it to Christopher.");
    console.log("");
    process.exitCode = 1;
    return;
  }
  console.log("  Your second brain is ready.");
  console.log("");
  console.log("  From now on, open your second brain by double-clicking");
  console.log("  \"Second Brain\" on your Desktop. You never have to type a path.");
  console.log("");
  console.log("  Do that now. It will introduce itself and ask you a few questions.");
  console.log("");
  console.log("  If anything ever seems off, type  /doctor");
  console.log("");
}

main().catch((err) => {
  console.log("");
  console.log("  Unexpected problem: " + err.message);
  console.log("  Copy this screen and send it to Christopher.");
  console.log("");
  process.exitCode = 1;
});
