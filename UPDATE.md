# Getting updates

The kit changes. Skills get added and fixed. This is how you pull those changes.

**Three things are true before you start:**

1. **Your vault is never touched.** Updates only replace skills, which are
   instructions for Claude. Your notes, deals, contacts and properties are yours.
2. **You do not need a GitHub account.** No login, no invite, no username.
3. **You do not need to install anything.** Not git, not anything else.

---

## The easy way: ask Claude to do it

You already have Claude. Let it handle this. Open Claude Code and say:

> **update my class skills**

It will ask whether you are on Windows or a Mac, run the right thing, read any
error itself, and tell you what is new. If something goes wrong it fixes it rather
than handing the problem back to you.

That is the whole instruction. Everything below is for doing it by hand if you
would rather, or if you are helping someone else.

---

## Doing it by hand

Pick the section that matches how you installed the skills in class.

---

## If you installed with the Claude desktop app (no terminal, works everywhere)

You uploaded zip files under Settings, Capabilities, Skills. You update the same
way you installed. This route involves no commands at all and behaves identically
on Windows and Mac.

1. Download the current skills: **[click here](https://github.com/youdidwhat-towho/ai-builder-class/archive/refs/heads/main.zip)**
2. Unzip it. **Windows: right click, Extract All.** Double clicking opens a preview
   that has not actually extracted anything.
3. Inside, open `claude-config/skills/`. Each folder in there is one skill.
4. Zip up just the folder you want (for example `tldr`), and upload that zip in
   Settings, Capabilities, Skills.

You only need to re-upload the skills that actually changed. If you are not sure,
re-upload all of them, it does no harm.

---

## If you installed with Claude Code, on Windows

Open PowerShell, paste this whole line, press enter:

```powershell
[Net.ServicePointManager]::SecurityProtocol = 'Tls12'; irm https://raw.githubusercontent.com/youdidwhat-towho/ai-builder-class/main/update.ps1 | iex
```

Yes, it is long. Paste the whole thing including the first part. That first part
tells older Windows machines to use a security setting GitHub requires, and without
it the download fails with a confusing error about a "secure channel."

## If you installed with Claude Code, on a Mac

Open Terminal, paste this, press return:

```bash
curl -fsSL https://raw.githubusercontent.com/youdidwhat-towho/ai-builder-class/main/update.sh | bash
```

Either one is safe to run again any time you hear there is something new. Running
it twice does nothing bad.

**Then restart Claude Code.** Type `/` and the new skill should be in the list. If
it is not there, you did not restart. That is almost always what it is.

---

## If a command fails

Tell Claude what happened, in these words:

> I ran the update command and got this, I'm on [Mac or Windows]:

then paste the whole error. Do not retype it or summarize it, paste it.

### The three Windows ones worth knowing

**"Could not create SSL/TLS secure channel."** You left off the first part of the
line. Paste the whole thing.

**"Running scripts is disabled on this system."** Paste this, then try again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

That applies to that one window only and goes back to normal when you close it.

**It seems to hang on "Downloading."** Give it a minute before deciding. If it is
still sitting there, close PowerShell, open a new one, and paste the line again.

### If none of that works, you are not stuck

Use the no-terminal route at the top of this page. Download the zip, unzip with
right click and **Extract All**, and copy the folders from `claude-config/skills/`
into your `.claude/skills` folder. It is more clicking and it always works.

---

## What gets replaced, and what does not

| Thing | Updated | Why |
|---|---|---|
| `claude-config/skills/` | **Yes, overwritten** | Instructions, not your data |
| `claude-config/commands/` | **Yes, overwritten** | Same |
| Your vault folder | **Never** | Your notes |
| Your `CLAUDE.md` and `MEMORY.md` | **Never** | Yours the moment you did onboarding |

🚨 **If you edited a skill yourself, updating overwrites your edit.** That is the
price of updates being one command. If you changed a skill and want to keep it,
save it under a new name first, `my-deal-intake` instead of `deal-intake`. Your
version then survives every update.

---

## Just want to read the files?

The repo is public, nothing to sign in to:

**https://github.com/youdidwhat-towho/ai-builder-class**

Every skill is a plain text file. Open any of them and read exactly what Claude was
told to do. Nothing in this kit is hidden from you.
