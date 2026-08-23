// Everything that differs between a Mac and a Windows machine, in one file.
//
// Design rule for this whole kit: platform branches live here and nowhere
// else. The old kit leaked Bash into a settings.json example and shipped a
// `date -v` hook, so a Windows student's install was broken before they
// opened it. One file means one place to audit, and one place to fix when
// a real Windows machine finally proves me wrong.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const IS_WIN = process.platform === "win32";
export const IS_MAC = process.platform === "darwin";

/**
 * Quote a path for embedding in a hook command string.
 *
 * Hook commands are handed to a shell: cmd.exe on Windows, sh elsewhere.
 * Christopher's students put vaults in folders like "Blueman Investing",
 * so spaces are not hypothetical. Double quotes work in both shells; the
 * difference is what else needs escaping inside them.
 */
export function quote(p) {
  if (IS_WIN) {
    // cmd.exe has no escape character inside double quotes. A path
    // containing a double quote cannot be represented, so refuse rather
    // than emit a command that silently does the wrong thing.
    if (p.includes('"')) {
      throw new Error(`Path contains a double quote, which cmd.exe cannot handle: ${p}`);
    }
    return `"${p}"`;
  }
  return `"${p.replace(/(["$`\\])/g, "\\$1")}"`;
}

/** The hook command that runs one of our Node scripts. */
export function nodeCommand(scriptPath) {
  return `node ${quote(scriptPath)}`;
}

/** Where scheduled-job artifacts live. */
export function kitHome() {
  return path.join(os.homedir(), ".claude", "second-brain");
}

/**
 * Register a daily scheduled job.
 *
 * Mac: launchd via a plist in ~/Library/LaunchAgents.
 * Windows: Task Scheduler via schtasks.exe.
 *
 * Returns {ok, detail}. Never throws: a machine that will not accept a
 * scheduled job should still finish the install with everything else
 * working, and say so loudly rather than fail the whole run.
 */
export function scheduleDaily({ label, scriptPath, hour, minute }) {
  try {
    return IS_WIN
      ? scheduleWindows({ label, scriptPath, hour, minute })
      : scheduleLaunchd({ label, scriptPath, hour, minute });
  } catch (err) {
    return { ok: false, detail: err.message };
  }
}

function scheduleWindows({ label, scriptPath, hour, minute }) {
  const nodeExe = process.execPath;
  // schtasks takes the whole command as one /TR value. Inner quotes get
  // doubled, which is cmd.exe's only quoting mechanism.
  const tr = `\\"${nodeExe}\\" \\"${scriptPath}\\"`;
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  execFileSync(
    "schtasks",
    ["/Create", "/F", "/SC", "DAILY", "/TN", label, "/TR", tr, "/ST", time],
    { stdio: "pipe" }
  );
  return { ok: true, detail: `Task Scheduler job "${label}" at ${time} daily` };
}

function scheduleLaunchd({ label, scriptPath, hour, minute }) {
  const dir = path.join(os.homedir(), "Library", "LaunchAgents");
  fs.mkdirSync(dir, { recursive: true });
  const plistPath = path.join(dir, `${label}.plist`);
  const logDir = kitHome();
  fs.mkdirSync(logDir, { recursive: true });

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>${scriptPath}</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>${hour}</integer>
    <key>Minute</key><integer>${minute}</integer>
  </dict>
  <key>StandardOutPath</key><string>${path.join(logDir, label + ".log")}</string>
  <key>StandardErrorPath</key><string>${path.join(logDir, label + ".err.log")}</string>
  <key>RunAtLoad</key><false/>
</dict>
</plist>
`;
  fs.writeFileSync(plistPath, plist, "utf8");

  // bootout first so a re-run replaces cleanly instead of erroring.
  const uid = process.getuid ? process.getuid() : 501;
  try {
    execFileSync("launchctl", ["bootout", `gui/${uid}/${label}`], { stdio: "pipe" });
  } catch {
    // not loaded yet, which is the normal first-install case
  }
  execFileSync("launchctl", ["bootstrap", `gui/${uid}`, plistPath], { stdio: "pipe" });

  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { ok: true, detail: `launchd job "${label}" at ${time} daily` };
}

/** Is a scheduled job of ours registered? Used by /doctor. */
export function scheduleExists(label) {
  try {
    if (IS_WIN) {
      execFileSync("schtasks", ["/Query", "/TN", label], { stdio: "pipe" });
      return true;
    }
    const out = execFileSync("launchctl", ["list"], { encoding: "utf8" });
    return out.includes(label);
  } catch {
    return false;
  }
}
