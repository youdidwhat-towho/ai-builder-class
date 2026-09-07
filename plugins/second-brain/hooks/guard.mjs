#!/usr/bin/env node
// Damage control. One guard for every tool that can reach a file.
//
// Claude Code is careful most of the time. This is for the other times: the
// rm -rf that was meant for a scratch folder, the .env that gets cat'ed into
// a transcript, the shell startup file that gets rewritten. A rule in
// CLAUDE.md is guidance. A hook is a wall.
//
// Runs on two events, and reads which one from the payload:
//
//   PreToolUse   Bash: dangerous command patterns, protected paths named in
//                      the command, changes to read-only paths, deletion of
//                      no-delete paths.
//                Edit, Write, MultiEdit, NotebookEdit: the file must not be
//                      zero-access or read-only.
//                Read, Grep, Glob: the file or folder must not be zero-access.
//                      Read-only means exactly that, so those stay readable.
//   PostToolUse  Bash, Read: scan the output for something that looks like a
//                      credential and say so. Observes only, never blocks.
//
// Three verdicts. Allow is exit 0 with nothing printed. Ask prints the
// hookSpecificOutput JSON Claude Code reads for a confirmation prompt. Block
// is exit 2 with the reason on stderr, which Claude sees and can act on.
//
// Patterns live in guard-patterns.json beside this file. A person can add
// their own in ~/.claude/second-brain-guard.json with the same keys; those
// are merged on top, never replacing the base. That is where an industry
// layer puts its credential files.
//
// Every guard here shares ONE path matcher. The original was four Python
// scripts, and a hole opened the day one of them matched differently from
// the other three. One matcher, one definition of "protected".
//
// Node, not Python, for the same reason as the rest of the kit: it has to
// run on a Windows machine that has never seen python3. Any internal error
// fails open. A broken guard must not wedge a session.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, "guard-patterns.json");
const USER = path.join(os.homedir(), ".claude", "second-brain-guard.json");

const PATH_KEYS = ["zeroAccessPaths", "readOnlyPaths", "noDeletePaths"];

/* ---------- patterns ---------- */

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function loadPatterns(baseFile = BASE, userFile = USER) {
  const base = readJson(baseFile) || {};
  const user = readJson(userFile) || {};
  const out = {
    bashToolPatterns: [...(base.bashToolPatterns || []), ...(user.bashToolPatterns || [])],
  };
  for (const k of PATH_KEYS) out[k] = [...(base[k] || []), ...(user[k] || [])];
  return out;
}

/* ---------- paths ---------- */

const home = () => os.homedir().replace(/\\/g, "/");

/** ~ and $HOME to the real home, backslashes to slashes. */
export function expand(p) {
  let s = String(p || "").replace(/\\/g, "/");
  if (s === "~" || s.startsWith("~/")) s = home() + s.slice(1);
  s = s.replace(/\$HOME\b|\$\{HOME\}|%USERPROFILE%/g, home());
  return s;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Does a file path hit a protected pattern?
 *   folders  ("~/.ssh/", "reference/credentials/")  the path contains them
 *   globs    ("*.pem")                               any single segment matches
 *   names    (".env", "id_rsa")                      a segment equals it
 * Segment-aware on purpose. "lender-credentials.md" is not "credentials.json",
 * and "process.environment" is not ".env".
 */
export function pathHits(filePath, patterns) {
  const fp = expand(filePath);
  const lower = fp.toLowerCase();
  const segments = fp.split("/").filter(Boolean);
  for (const raw of patterns) {
    const pat = String(raw);
    const ex = expand(pat);
    if (pat.includes("*")) {
      if (pat.includes("/")) {
        // a globbed folder, like "~/.config/gws-*/"
        const re = new RegExp(escapeRe(ex.replace(/\/$/, "")).replace(/\\\*/g, "[^/]*") + "(?:/|$)", "i");
        if (re.test(fp)) return pat;
      } else {
        const re = new RegExp("^" + escapeRe(pat).replace(/\\\*/g, "[^/]*") + "$", "i");
        if (segments.some((s) => re.test(s))) return pat;
      }
    } else if (pat.endsWith("/") || pat.replace(/^\/+|\/+$/g, "").includes("/")) {
      const needle = ex.replace(/\/$/, "").toLowerCase();
      const bare = pat.replace(/\/$/, "").toLowerCase();
      if (lower.includes(needle) || lower.includes(bare)) return pat;
      // "~/.ssh/" must also catch somebody else's home, and a Windows one:
      // the folder name under any home, as its own segment run.
      if (bare.startsWith("~/")) {
        const tail = "/" + bare.slice(2) + "/";
        if ((lower + "/").includes(tail)) return pat;
      }
    } else if (segments.some((s) => s.toLowerCase() === pat.toLowerCase())) {
      return pat;
    }
  }
  return null;
}

/**
 * Does a shell command NAME a protected path? Token-bounded: ".env" matches
 * "cat .env" and "cat foo/.env" but not ".envrc" or "process.environment".
 */
export function commandNames(command, patterns) {
  const LEFT = "(?:^|[\\s\"'=(:/])";
  for (const raw of patterns) {
    const pat = String(raw);
    for (const cand of new Set([pat, expand(pat)])) {
      const esc = escapeRe(cand.replace(/\/$/, "")).replace(/\\\*/g, "[^\\s\"']*");
      const right = "(?=$|[\\s\"'):;,/])";
      try {
        if (new RegExp(LEFT + esc + right, "i").test(command)) return pat;
      } catch {
        /* skip a bad pattern */
      }
    }
  }
  return null;
}

/* ---------- verdicts ---------- */

export function checkBash(rawCommand, cfg) {
  const command = String(rawCommand).replace(/\\/g, "/"); // Windows paths, so ".git/" still matches C:\x\.git
  // A block anywhere beats an ask anywhere. "rm -rf /" matches the ask-tier
  // "rm -rf <anything>" first in the list; it must still be a block.
  let ask = null;
  for (const item of cfg.bashToolPatterns) {
    try {
      if (new RegExp(item.pattern, "i").test(command)) {
        const reason = item.reason || "matched a blocked pattern";
        if (!item.ask) return { verdict: "block", reason };
        ask = ask || { verdict: "ask", reason };
      }
    } catch {
      /* skip a bad pattern */
    }
  }

  let hit = commandNames(command, cfg.zeroAccessPaths);
  if (hit) return { verdict: "block", reason: `Access to protected path blocked: ${hit}` };

  // Verbs are word-bounded commands, not substrings ("form " is not "rm ").
  // A redirect to /dev/null is read-only noise.
  const modifies = /(?:^|[;&|`$(\s])(?:rm|mv|tee|chmod|chown|Remove-Item|Set-Content|Add-Content|Out-File)\s|>>?(?!\s*\/dev\/null)|\bsed\s+-i/i;
  if (modifies.test(command)) {
    hit = commandNames(command, cfg.readOnlyPaths);
    if (hit) return { verdict: "block", reason: `Modification of read-only path blocked: ${hit}` };
  }

  const deletes = /(?:^|[;&|`$(\s])(?:rm|rmdir|unlink|del|rd|Remove-Item)\s/i;
  if (deletes.test(command)) {
    hit = commandNames(command, cfg.noDeletePaths);
    if (hit) return { verdict: "block", reason: `Deletion of protected path blocked: ${hit}` };
  }

  return ask || { verdict: "allow" };
}

export function checkWrite(filePath, cfg) {
  let hit = pathHits(filePath, cfg.zeroAccessPaths);
  if (hit) return { verdict: "block", reason: `Cannot edit a protected file matching: ${hit}` };
  hit = pathHits(filePath, cfg.readOnlyPaths);
  if (hit) return { verdict: "block", reason: `Cannot edit a read-only file matching: ${hit}` };
  return { verdict: "allow" };
}

/** Could a search glob like ".env*" or "**\/*.pem" land on a protected name? */
function globReaches(glob, patterns) {
  const last = String(glob).replace(/\\/g, "/").split("/").pop() || "";
  if (!last.includes("*") && !last.startsWith(".")) return null;
  const re = new RegExp("^" + escapeRe(last).replace(/\\\*/g, ".*") + "$", "i");
  for (const pat of patterns) {
    const name = String(pat).replace(/\/$/, "").split("/").pop().replace(/\*/g, "");
    if (name && re.test(name)) return pat;
  }
  return null;
}

export function checkRead(toolName, input, cfg) {
  const targets = toolName === "Read" ? [input.file_path] : [input.path];
  const globs = [];
  if (toolName !== "Read") {
    for (const k of ["glob", "pattern"]) {
      const v = input[k];
      if (!v) continue;
      if (String(v).includes("/") || String(v).startsWith(".")) targets.push(v);
      globs.push(v);
    }
  }
  for (const t of targets) {
    if (!t) continue;
    const hit = pathHits(t, cfg.zeroAccessPaths) || (globs.includes(t) && globReaches(t, cfg.zeroAccessPaths));
    if (hit)
      return {
        verdict: "block",
        reason:
          `${toolName} of a protected path matching: ${hit}\n` +
          "Zero-access paths are unreadable by design. If you need to know whether a value is present, test for it without printing it.",
      };
  }
  return { verdict: "allow" };
}

/* ---------- secrets in output ---------- */

const SECRETS = [
  [/sk-ant-[A-Za-z0-9\-_]{20,}/, "Anthropic API key", "console.anthropic.com/settings/keys"],
  [/sk-[A-Za-z0-9]{48,}/, "OpenAI API key", "platform.openai.com/api-keys"],
  [/gh[pousr]_[A-Za-z0-9]{36,}/, "GitHub token", "github.com/settings/tokens"],
  [/AKIA[A-Z0-9]{16}/, "AWS access key", "console.aws.amazon.com/iam"],
  [/-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, "Private key", "generate a new key pair"],
  [/xox[baprs]-[A-Za-z0-9\-]{10,}/, "Slack token", "api.slack.com/apps"],
  [/ya29\.[A-Za-z0-9\-_]{30,}/, "Google access token", "revoke at myaccount.google.com/permissions"],
  [/AIza[A-Za-z0-9\-_]{35}/, "Google API key", "console.cloud.google.com/apis/credentials"],
  [/Bearer\s+[A-Za-z0-9\-_.]{20,}/, "Bearer token", "rotate at the issuing service"],
  [/(?:api[_-]?key|password|secret)['"]?\s*[:=]\s*['"][^'"\s]{12,}['"]/i, "Hardcoded credential", "change it and move it to a secrets file"],
];

export function scanSecrets(text) {
  return SECRETS.filter(([re]) => re.test(text)).map(([, name, fix]) => ({ name, fix }));
}

function outputText(payload) {
  const r = payload.tool_response ?? payload.tool_output ?? "";
  if (typeof r === "string") return r;
  if (r && typeof r === "object") {
    return [r.stdout, r.stderr, r.content, r.output, r.file?.content].filter((x) => typeof x === "string").join("\n");
  }
  return "";
}

/* ---------- main ---------- */

export function decide(payload, cfg) {
  const event = payload.hook_event_name || (payload.tool_response !== undefined ? "PostToolUse" : "PreToolUse");
  const tool = payload.tool_name || "";
  const input = payload.tool_input || {};

  if (event === "PostToolUse") {
    if (tool !== "Bash" && tool !== "Read") return { verdict: "allow" };
    const found = scanSecrets(outputText(payload));
    if (!found.length) return { verdict: "allow" };
    return {
      verdict: "warn",
      reason:
        "Possible credential in that output: " +
        found.map((f) => `${f.name} (${f.fix})`).join("; ") +
        ". Do not repeat it in your reply, and treat it as exposed."
    };
  }

  if (tool === "Bash") return checkBash(String(input.command || ""), cfg);
  if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool))
    return checkWrite(String(input.file_path || input.notebook_path || ""), cfg);
  if (["Read", "Grep", "Glob"].includes(tool)) return checkRead(tool, input, cfg);
  return { verdict: "allow" };
}

function main() {
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return; // fail open
  }
  const r = decide(payload, loadPatterns());
  if (r.verdict === "allow") return;
  if (r.verdict === "warn") {
    process.stderr.write(`GUARD: ${r.reason}\n`);
    return;
  }
  if (r.verdict === "ask") {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
          permissionDecisionReason: r.reason,
        },
      }) + "\n"
    );
    return;
  }
  process.stderr.write(`BLOCKED: ${r.reason}\n`);
  process.exitCode = 2;
}

// Only run when executed directly. Importing (tests, /doctor) must never judge anything.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch {
    // fail open
  }
}
