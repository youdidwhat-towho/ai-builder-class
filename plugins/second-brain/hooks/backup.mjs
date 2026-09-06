#!/usr/bin/env node
// Backup. Runs nightly after reflection and puts the vault somewhere that
// is not this laptop.
//
// A second brain that lives on one disk is one spilled coffee from gone,
// and the person least able to rebuild it is the person who needed it
// most. So every night: commit whatever changed, and push it if there is
// anywhere to push to.
//
// Three honest states. The morning check-in and /doctor both say which
// one you are in, because a backup nobody can see the status of is a
// backup nobody trusts:
//
//   pushed   the vault is on the remote as of last night
//   local    committed here, no remote connected yet. History, not backup.
//   failed   there is a remote and the push did not land. Loud on purpose.
//
// No model, no network beyond the push itself, no dependency beyond git.
// Never touches note content. Never deletes. Never force-pushes. A repo
// gets created if there is none, because local history on day one is
// still worth more than nothing.
//
// Usage: node backup.mjs [vault-path]

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { vaultPath, today, now, read, backupState } from "../lib/vault.mjs";

/** State file the heartbeat, session-start and doctor read. Lives in the vault, git-ignored. */
export const STATE_FILE = ".backup";

/** Machine-local files that must never ride along in a backup. */
const IGNORE = [
  "# Search index, rebuilt on demand. Large and machine-specific.",
  ".search-index.json",
  "",
  "# Local state written by the daily jobs.",
  ".heartbeat",
  ".reflected",
  ".maintenance",
  ".backup",
  "",
  ".DS_Store",
  "",
];

function git(vault, args, timeout = 30_000) {
  return execFileSync("git", args, {
    cwd: vault,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout,
  }).trim();
}

function tryGit(vault, args, timeout) {
  try {
    return git(vault, args, timeout);
  } catch {
    return null;
  }
}

/** The last useful line of a git failure, for a human. */
function reason(err) {
  const text = (err.stderr?.toString() || err.stdout?.toString() || err.message || "").trim();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // git says the real cause on its first "fatal:" or "error:" line and then
  // adds advice. The advice is what a last-line grab returns, and "and the
  // repository exists." is not a reason anybody can act on.
  const line =
    lines.find((l) => /^(fatal|error):/i.test(l)) ||
    lines.find((l) => !/^(To |remote: *$|hint:|Please )/.test(l)) ||
    lines[0] ||
    "unknown";
  return line.replace(/^(fatal|error):\s*/i, "").slice(0, 200);
}

function writeState(vault, state) {
  try {
    // Merge, so a bad night does not erase the last good pushedAt.
    const prev = backupState(vault) || {};
    const next = { ...prev, ...state, at: new Date().toISOString() };
    fs.writeFileSync(path.join(vault, STATE_FILE), JSON.stringify(next, null, 2) + "\n", "utf8");
  } catch {
    // never fail the job over the status file
  }
}

/** Make sure the machine-local files stay out of the repo. Idempotent. */
function ensureIgnore(vault) {
  const file = path.join(vault, ".gitignore");
  const have = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const want = IGNORE.filter((l) => l && !l.startsWith("#") && !have.split("\n").includes(l));
  if (!have) fs.writeFileSync(file, IGNORE.join("\n"), "utf8");
  else if (want.length) fs.appendFileSync(file, "\n" + want.join("\n") + "\n", "utf8");
}

/**
 * A commit needs an author. Most people never set one, and a nightly job
 * that dies on "please tell me who you are" is a backup that never ran.
 * Use the name they gave at onboarding, fall back to the login name.
 */
function identityArgs(vault) {
  const hasName = tryGit(vault, ["config", "user.name"]);
  const hasEmail = tryGit(vault, ["config", "user.email"]);
  if (hasName && hasEmail) return [];
  const memory = read(vault, "MEMORY.md");
  const m = memory.match(/^[ \t]*[-*]?[ \t]*name:[ \t]*(\S.*)$/im);
  const login = os.userInfo().username || "second-brain";
  const name = (m ? m[1].trim() : login) || login;
  const email = `${login.toLowerCase().replace(/[^a-z0-9._-]+/g, "-")}@second-brain.local`;
  return ["-c", `user.name=${name}`, "-c", `user.email=${email}`];
}

function main() {
  const vault = process.argv[2] ? path.resolve(process.argv[2]) : vaultPath();
  if (!vault || !fs.existsSync(vault)) {
    console.error("backup: no vault configured");
    process.exit(1);
  }

  try {
    git(vault, ["--version"]);
  } catch {
    writeState(vault, { state: "failed", error: "git is not installed on this machine" });
    console.error("backup: git is not installed, nothing can be saved");
    process.exit(1);
  }

  // A vault with no repo gets one. Local history is the floor.
  if (!tryGit(vault, ["rev-parse", "--is-inside-work-tree"])) {
    git(vault, ["init", "-q", "-b", "main"]);
  }
  ensureIgnore(vault);

  // Commit whatever changed since last night.
  const id = identityArgs(vault);
  let committed = false;
  if (git(vault, ["status", "--porcelain"])) {
    git(vault, ["add", "-A"]);
    git(vault, [...id, "commit", "-q", "-m", `backup ${today()} ${now()}`]);
    committed = true;
  }

  // Anywhere to push to?
  const remote = tryGit(vault, ["remote", "get-url", "origin"]);
  if (!remote) {
    writeState(vault, { state: "local", committed, remote: null, error: null });
    console.log(
      `backup: ${committed ? "committed" : "nothing new"}, no remote connected. ` +
        "History is on this laptop only."
    );
    return;
  }

  // Push if there is anything the remote does not have. Never force.
  const upstream = tryGit(vault, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
  const behind = upstream ? Number(tryGit(vault, ["rev-list", "--count", "@{u}..HEAD"]) || 0) : 1;
  if (!committed && behind === 0) {
    writeState(vault, { state: "pushed", committed: false, remote, error: null });
    console.log("backup: nothing new, remote is current");
    return;
  }

  try {
    const args = upstream ? ["push", "-q"] : ["push", "-q", "-u", "origin", "HEAD"];
    git(vault, args, 90_000);
    writeState(vault, {
      state: "pushed",
      committed,
      remote,
      error: null,
      pushedAt: new Date().toISOString(),
    });
    console.log(`backup: pushed to ${remote}`);
  } catch (err) {
    const why = reason(err);
    writeState(vault, { state: "failed", committed, remote, error: why });
    console.error(`backup: committed locally but the push failed: ${why}`);
    process.exit(1);
  }
}

// Only run when executed directly. Importing this file (doctor, tests)
// must never trigger a backup.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (err) {
    console.error("backup failed: " + reason(err));
    process.exit(1);
  }
}
