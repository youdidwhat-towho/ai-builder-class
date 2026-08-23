// The desktop icon.
//
// Terminal-first is not negotiable: the Claude desktop app cannot run hooks,
// so a second brain that greets you, logs changes, and runs on a schedule is
// impossible there. But "open a terminal and cd to your vault" is where a
// non-technical person stops.
//
// So they never do that. They double-click one icon and land inside their
// second brain with Claude already running. No prompt, no path, no cd.
//
// Windows gets a .bat rather than a .lnk on purpose. A shortcut needs COM
// through PowerShell, and on 2026-08-22 a student's PowerShell refused to run
// scripts at all ("running scripts is disabled on this system"). A .bat runs
// in cmd.exe, which that policy does not touch.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const IS_WIN = process.platform === "win32";

/** Is Windows Terminal available? It is far better than the legacy console. */
export function hasWindowsTerminal() {
  if (!IS_WIN) return false;
  try {
    execFileSync("where", ["wt.exe"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function desktopDir() {
  const d = path.join(os.homedir(), "Desktop");
  return fs.existsSync(d) ? d : os.homedir();
}

/**
 * Write the launcher. Returns {ok, file, note}.
 * Never throws: a missing icon is a papercut, not a failed install.
 */
export function createLauncher(vault) {
  try {
    return IS_WIN ? windowsLauncher(vault) : macLauncher(vault);
  } catch (err) {
    return { ok: false, note: err.message };
  }
}

function windowsLauncher(vault) {
  const file = path.join(desktopDir(), "Second Brain.bat");
  const wt = hasWindowsTerminal();

  // `wt -d <dir> claude` opens Windows Terminal already in the vault.
  // Without it, fall back to the legacy console rather than shipping an
  // icon that does nothing, and say so in the setup output.
  const body = wt
    ? `@echo off\r\nwt -d "${vault}" claude\r\n`
    : `@echo off\r\ncd /d "${vault}"\r\nclaude\r\n`;

  fs.writeFileSync(file, body, "utf8");
  return {
    ok: true,
    file,
    note: wt
      ? "opens Windows Terminal in your vault"
      : "Windows Terminal is not installed. The icon still works, but install Windows Terminal from the Microsoft Store for a much better experience (copy and paste actually work).",
  };
}

function macLauncher(vault) {
  const file = path.join(desktopDir(), "Second Brain.command");
  const body = `#!/bin/bash
# Opens your second brain. Double-click this.
cd ${JSON.stringify(vault)} || exit 1
exec claude
`;
  fs.writeFileSync(file, body, "utf8");
  fs.chmodSync(file, 0o755);
  return { ok: true, file, note: "double-click to open your second brain" };
}
