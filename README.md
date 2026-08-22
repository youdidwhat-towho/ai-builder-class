# AI Builder Class: starter kit

Everything from the class, in one place. A working second brain, the skills that
drive it, and the coaching system that teaches you while you use it.

Nothing here is a demo. It all runs.

---

## What's in the box

| Folder | What it is |
|---|---|
| `vault-starter/` | Your second brain. A working Obsidian vault, not an empty template. |
| `claude-config/skills/` | Ten skills. Onboarding, capture, deal intake, checkpoint, tldr, end of day, coaching, updates, and two comps tools. |
| `claude-config/commands/` | Slash commands. Start with `/pickup`. |
| `claude-config/settings.example.json` | A working hook, with notes on what hooks are for. |
| `docs/` | Read `first-hour.md` first. |
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

## What each skill does

| Skill | Say this |
|---|---|
| `second-brain-onboarding` | "let's set up my second brain" |
| `capture` | "capture this", or just start talking |
| `deal-intake` | "new deal", or paste a lead in any shape |
| `checkpoint` | "checkpoint", "save where we are", "I have to go" |
| `tldr` | "tldr", "save this session", "write this up" |
| `end-of-day` | "wrap up", "close out the day" |
| `coaching-callouts` | Nothing. Always on. It teaches while you work. |
| `update-kit` | "update my class skills" |
| `comps-propwire` | "run comps on 1247 Oak" (free, all 50 states) |
| `comps-propelio` | Same, for non-disclosure states |

The comps skills drive a real browser using your own logged-in account, so you need
browser access connected and you need to already be signed in to those sites. They
will never try to log in for you.

---

## Getting updates later

New skills get added and existing ones get fixed. No GitHub account, nothing to
install.

**Easiest way, say this to Claude:**

> update my class skills

It figures out your operating system, runs the right thing, and handles any error
itself. If you would rather run it yourself:

**Windows**, PowerShell:
```powershell
[Net.ServicePointManager]::SecurityProtocol = 'Tls12'; irm https://raw.githubusercontent.com/youdidwhat-towho/ai-builder-class/main/update.ps1 | iex
```

**Mac**, Terminal:
```bash
curl -fsSL https://raw.githubusercontent.com/youdidwhat-towho/ai-builder-class/main/update.sh | bash
```

It replaces skills only and never touches your vault. Restart Claude Code after.
If you installed through the desktop app instead, see `UPDATE.md` for the upload
version.

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
