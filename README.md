# AI Builder Class: starter kit

Everything from the class, in one place. A working second brain, the skills that
drive it, and the coaching system that teaches you while you use it.

Nothing here is a demo. It all runs.

---

## What's in the box

| Folder | What it is |
|---|---|
| `vault-starter/` | Your second brain. A working Obsidian vault, not an empty template. General on purpose: no industry, no vendors. |
| `claude-config/skills/` | Ten skills. Onboarding, capture, intake, checkpoint, tldr, end of day, maintain, week review, coaching, and updates. |
| `claude-config/commands/` | Slash commands. Start with `/pickup`. |
| `claude-config/settings.example.json` | A working hook, with notes on what hooks are for. |
| `docs/` | Read `first-hour.md` first. |
| `client-addons/` | Not shipped. The pattern for building somebody's industry layer at install, plus one worked example. |
| `UPDATE.md` | How to pull new skills later. No GitHub account needed. |

---

## Start here, about ten minutes

**1. Put the vault somewhere you will find it.**

Works the same on Mac and Windows. Unzip `second-brain-starter.zip` into your home
folder.

🚨 **Windows: right click the zip and choose Extract All.** Double clicking opens a
preview window that looks like a folder but has not actually extracted anything, and
files dragged out of a preview sometimes arrive empty. It expands to a folder
already named `second-brain`, lowercase with the hyphen, so nothing to rename and
class instructions match your screen exactly.

(If you are reading this inside the repo instead of from the zip, the same folder is
here as `vault-starter/`. Copy it out and rename it `second-brain`.)

**2. Open it in Obsidian.**

Obsidian → *Open folder as vault* → pick your new `second-brain` folder.

**3. Install the skills.**

Two ways, pick the one that matches what you are running:

- **Claude desktop app:** Settings, Capabilities, Skills, upload each skill's zip.
  This needs no terminal at all and works the same on Windows and Mac.
- **Claude Code, Windows:** open PowerShell and run
  ```powershell
  mkdir "$env:USERPROFILE\.claude\skills" -Force
  Copy-Item -Recurse -Force claude-config\skills\* "$env:USERPROFILE\.claude\skills\"
  ```
- **Claude Code, Mac:** open Terminal and run
  ```bash
  mkdir -p ~/.claude/skills
  cp -R claude-config/skills/* ~/.claude/skills/
  ```

  Then restart Claude Code. Type `/` and you should see them.

  Only take this path if you are already comfortable in a terminal. The desktop
  upload above does the same job with no typing.

**4. Give Claude access to the vault folder** and say this:

> let's set up my second brain

It will interview you for about fifteen minutes and write the answers into your
vault. **Do this part for real.** It is the difference between a chatbot that
sounds smart and a second brain that knows your business.

**5. Then put one real thing in.**

A deal, a call you had this week, a list you are sitting on. Messy is fine, messy is
better. Then ask it what to do about it.

---

## The one habit

**Everything goes in `daily/` first.** Every note, every call recap, every stray
thought. Do not stop to decide where it belongs.

That decision is where capture dies. Filing happens later and Claude does it.

---

## The two that keep it true

Capture is what makes a second brain useful in week one. These are what keep
it useful in month six, when half of what it tells you stopped being true.

**Every couple of weeks, say `maintain`.** It shows you what has gone quiet
or finished, you say what moves to `archive/`. Archived is not deleted, it is
just out of the way of everyday questions.

**Once a week, say `week-review`.** It tells you what it thinks changed in
your business, specific enough to be wrong. You correct it, and it writes the
correction down on the spot. Then you rate the week, and a low score gets you
asked why instead of thanked.

Skipping these is how people end up with a vault full of March.

---

## What each skill does

| Skill | Say this |
|---|---|
| `second-brain-onboarding` | "let's set up my second brain" |
| `capture` | "capture this", or just start talking |
| `intake` | "intake this", or paste anything unstructured |
| `checkpoint` | "checkpoint", "save where we are", "I have to go" |
| `tldr` | "tldr", "save this session", "write this up" |
| `end-of-day` | "wrap up", "close out the day" |
| `maintain` | "maintain", "prune", "what's gone stale". Every couple of weeks. |
| `week-review` | "week review". Once a week. It tells you what it thinks it learned and you correct it. |
| `coaching-callouts` | Nothing. Always on. It teaches while you work. |
| `update-kit` | "update my class skills" |

Nothing in that list assumes an industry or a piece of software. Whatever you
actually do for a living gets added on top, at install, built around the tools
you already use. See `client-addons/`.

---

## Getting updates later

New skills get added and existing ones get fixed. Say this to Claude:

> **update my class skills**

It downloads the latest from the public repo, installs it, and tells you what is
new. Your vault is never touched. Restart Claude Code afterward.

If you would rather do it by hand, `UPDATE.md` has a click-only version that needs
no commands at all.

🚨 **Nobody should ever paste a command they were handed in order to install or fix
Claude.** Fake "install Claude" ads and pages are common right now, and telling you
to paste a command is how most of them work. If a page or a message tells you to
paste something into PowerShell or Terminal, stop and ask in the group first. Real
updates never need that.

---

## When something does not work

1. Did you restart after installing skills? Most of the time it is this.
2. Ask Claude: *"what skills do you have?"* If yours are not listed, they did not
   install. That is a different problem from a skill that is installed but not firing.
3. Still stuck, bring it to the group.

---

## Keep it yours

This is a starting point, not a finished system. Everything here is a plain text
file you can open and edit. Change the wording, delete what you do not use, add
what you need.

The best version of this vault in six months will not look much like this one.
