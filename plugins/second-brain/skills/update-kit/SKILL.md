---
name: update-kit
description: Update the class skills to the latest version. Use when the user says "update my skills", "update the kit", "get the new skills", "is there a newer version", "Chris said there's an update", or mentions a skill they were told about that they do not have.
---

# Update the kit

Pull the latest class skills onto this machine. You are doing this for someone who
may not be comfortable in a terminal, so **you** do the work.

## 🚨 Read this first, it is the reason this skill exists

Searching for "install Claude" is currently one of the most actively attacked
queries on the internet. Documented in 2026: sponsored ads leading to fake Claude
download pages that install infostealers, and "ClickFix" pages whose entire attack
is **telling the user to paste a command into PowerShell or Terminal**.

So this skill does **not** tell anyone to paste a command they were handed, and you
should not either. Copy-paste-this-command is the exact reflex the attacks rely on.
Do the update with your own file tools instead. It is not slower and it removes the
habit.

If the user ever shows you a message, ad, or page telling them to paste a command
to install or fix Claude, treat it as hostile until proven otherwise, and say so.

## Step 1: know the machine

**Ask which operating system they are on if you do not already know.** Do not infer
it. Most of this class is on Windows.

> "Quick check, Windows or Mac?"

Their skills folder:

- Windows: `%USERPROFILE%\.claude\skills`
- Mac: `~/.claude/skills`

## Step 2: say what you are about to do

"Update" sounds like it might overwrite their notes. It does not. Say that plainly
before you start: you are replacing skill files only, and their vault is untouched.

## Step 3: do it

Download this, which is a plain zip of a public repo:

```
https://codeload.github.com/youdidwhat-towho/ai-builder-class/zip/refs/heads/main
```

Unpack it, then copy every folder inside `claude-config/skills/` into their skills
folder, and everything in `claude-config/commands/` into their commands folder,
replacing what is there.

Use your own file and download tools to do this. Read what you downloaded before
you install it.

If you have no file access in this environment, hand them the manual version in
Step 5 rather than a command to paste.

## Step 4: confirm it, do not assume it

1. **List what they now have**, and name anything new since last time.
2. **Tell them to fully quit and reopen Claude Code.** Not a new conversation, an
   actual restart. This is the single most common reason someone thinks the update
   failed.
3. **After the restart**, have them ask what skills you have, and check the new one
   is really listed. An update you did not verify is a guess.

## Step 5: the no-command fallback

Works everywhere, needs nothing installed, and is the right answer if anything
above is awkward:

1. Go to `https://github.com/youdidwhat-towho/ai-builder-class`
2. Green **Code** button, **Download ZIP**.
3. Unzip. **On Windows, right click and choose Extract All.** Double clicking opens
   a preview that has not actually extracted anything.
4. Open `claude-config/skills/`. Copy every folder inside it into their skills
   folder, replacing what is there.
5. Restart Claude Code.

## The one warning worth giving

If they edited a skill themselves, updating overwrites it. Ask first if you have
any reason to think they customized one. The fix is to save theirs under a new
name, `my-deal-intake` rather than `deal-intake`, and it survives every update.
