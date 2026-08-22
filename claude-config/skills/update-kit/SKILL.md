---
name: update-kit
description: Update the class skills to the latest version from the public repo. Use when the user says "update my skills", "update the kit", "get the new skills", "is there a newer version", "Chris said there's an update", or mentions a skill they were told about that they do not have.
---

# Update the kit

Pull the latest class skills onto this machine. You are doing this for someone who
may not be comfortable in a terminal, so you run the commands, not them.

## Before anything

**Find out which operating system they are on if you do not already know.** Do not
guess from the conversation. Most of this class is on Windows.

Say it plainly: "Quick check, are you on Windows or a Mac?"

## What you are about to do

Downloading a zip from a public GitHub repo and copying skill folders into their
`.claude/skills` directory. Their vault is never touched. Say that out loud before
you run it, because "update" sounds like it might overwrite their notes and it does
not.

## Windows

```powershell
[Net.ServicePointManager]::SecurityProtocol = 'Tls12'; irm https://raw.githubusercontent.com/youdidwhat-towho/ai-builder-class/main/update.ps1 | iex
```

## Mac

```bash
curl -fsSL https://raw.githubusercontent.com/youdidwhat-towho/ai-builder-class/main/update.sh | bash
```

## If it fails, do not make them debug it

Read the error yourself and handle it. Known ones:

| Error says | What it is | Do this |
|---|---|---|
| `SSL/TLS secure channel` | Old Windows defaulting to TLS 1.0 | The TLS prefix is already in the command above. If it still fails, use the manual route below |
| `running scripts is disabled` | Execution policy | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, that window only |
| `curl: command not found` | Very old Mac | Use the manual route below |
| Hangs on Downloading | Progress bar or slow link | Wait one minute, then retry in a fresh window |

**The manual route always works and needs no commands.** Do it for them:

1. Download `https://codeload.github.com/youdidwhat-towho/ai-builder-class/zip/refs/heads/main`
2. Unpack it.
3. Copy every folder inside `claude-config/skills/` into their skills folder:
   - Windows: `%USERPROFILE%\.claude\skills`
   - Mac: `~/.claude/skills`

If you have file access, just do this directly rather than narrating steps.

## After it runs

1. **List what they now have**, and name anything that is new since last time.
2. **Tell them to fully quit and reopen Claude Code.** Not a new conversation, a
   real restart. This is the single most common reason someone thinks the update
   failed.
3. **Then verify**, do not assume. After they restart, have them ask what skills
   you have, and confirm the new one is listed.

## The one warning worth giving

If they edited a skill themselves, this overwrites it. Ask before running if you
have any reason to think they customized one. Their fix: save it under a new name,
`my-deal-intake` rather than `deal-intake`, and it survives every future update.
