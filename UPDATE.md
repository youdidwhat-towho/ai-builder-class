# Getting updates

The kit changes. Skills get added and fixed. This is how you get those changes.

**Three things are true before you start:**

1. **Your vault is never touched.** Updates replace skills, which are instructions
   for Claude. Your notes, deals, contacts and properties are yours.
2. **You do not need a GitHub account.** No login, no invite, no username.
3. **You do not need to install anything.** Not git, not anything else.

---

## 🚨 Read this before you update anything, ever

Right now, searching for "install Claude" is one of the most attacked searches on
the internet. Through 2026 there have been paid ads leading to fake Claude download
pages that install password stealers, and pages whose whole trick is **telling you
to paste a command into PowerShell or Terminal**.

So, two rules, and they are worth more than this entire page:

- **Never paste a command you were handed in order to install or fix Claude.** Not
  from an ad, not from a search result, not from a DM, not from a helpful stranger.
  Pasting the command *is* the attack.
- **Never download Claude from a search ad.** Type the address yourself or use a
  bookmark. Sponsored results at the top are the ones being bought by attackers.

The update below needs no pasted commands. That is on purpose.

---

## The way to do it

Open Claude Code and say:

> **update my class skills**

It downloads the latest from the public repo, installs it, tells you what is new,
and reminds you to restart. That is the whole instruction.

Then **fully quit and reopen Claude Code**, not just a new conversation. Ask it
*what skills do you have* and confirm the new one is listed. If it is not there,
you did not restart. That is almost always what it is.

---

## Doing it by hand, no commands

Works on Windows and Mac, needs nothing installed.

1. Go to **https://github.com/youdidwhat-towho/ai-builder-class**
2. Click the green **Code** button, then **Download ZIP**.
3. Unzip it. **Windows: right click, Extract All.** Double clicking opens a preview
   that has not actually extracted anything, and files dragged out of a preview
   sometimes arrive empty.
4. Open the `claude-config/skills/` folder inside. Each folder in there is one skill.
5. Copy all of those folders into your skills folder, replacing what is there:
   - **Windows:** `%USERPROFILE%\.claude\skills`
   - **Mac:** `~/.claude/skills`
6. Restart Claude Code.

**If you installed through the Claude desktop app instead** (Settings, Capabilities,
Skills), you update the same way you installed: zip up the individual skill folder
from step 4 and upload it there. No terminal involved at any point.

---

## If you get stuck

Tell Claude what happened, in these words:

> I'm trying to update my class skills, I'm on [Windows or Mac], and here is what happened:

then paste what you saw. It can do the whole thing for you from there.

---

## What gets replaced, and what does not

| Thing | Updated | Why |
|---|---|---|
| Your skills folder | **Yes, overwritten** | Instructions, not your data |
| Your commands folder | **Yes, overwritten** | Same |
| Your vault folder | **Never** | Your notes |
| Your `CLAUDE.md` and `MEMORY.md` | **Never** | Yours the moment you did onboarding |

🚨 **If you edited a skill yourself, updating overwrites your edit.** If you changed
one and want to keep it, save it under a new name first, `my-deal-intake` rather
than `deal-intake`. Your version then survives every update.

---

## Want to read the files first?

Good instinct, and yes:

**https://github.com/youdidwhat-towho/ai-builder-class**

Every skill is plain text. Open any of them and read exactly what Claude was told to
do. Nothing in this kit is hidden from you, and "can I read it before I run it" is
the right question to ask of any software.
