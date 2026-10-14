# The Council and the Algorithm

Two skills for big decisions. Use them before you build anything large, spend real
money, or make a call that is hard to undo.

- **The Council** gets several AI advisors to argue a decision from different
  sides before you commit. An optimist, a devil's advocate, a neutral analyst, a
  capability scout that checks what you already have before you build, and a
  reliability engineer that asks what happens when it breaks in two months. Add
  `--extended` for three more: a pragmatist, an edge case finder, and a reframer
  who asks whether it is even the right question.
- **The Algorithm** runs any plan through five steps: question every requirement,
  delete, simplify, speed up, and automate last. It hands back a shorter plan.

**Councils add. The Algorithm cuts.** When a council recommends building
something, it runs the Algorithm on its own recommendations before writing the
plan, so you only build what survived.

---

## Say these

| To do this | Say |
|---|---|
| Get the five advisors on a decision | `council: should I ...` |
| All eight, for the big ones | `council --extended: ...` |
| Make the advisors argue with each other | `council debate ...` |
| Imagine it already failed, and find out why | `council premortem ...` |
| Cut a plan down | `run the algorithm on this` |
| Same, shorter | `what can we cut?` |

Every council is saved in your vault under `decisions/`, so next time the advisors
start from what you already decided.

**The council advises. You decide.** Read what changes about the plan, then make
the call.

---

## Install or update

They come with the kit. If you already have the kit, update it the normal way:
say **update my class skills**, then fully quit and reopen Claude Code. See
`UPDATE.md`.

To add just these two by hand:

1. Download the kit: **https://github.com/youdidwhat-towho/ai-builder-class**,
   green **Code** button, **Download ZIP**.
2. Unzip it. **Windows: right click, Extract All.**
3. Copy the `council` and `the-algorithm` folders from `claude-config/skills/`
   into your skills folder. Copy the whole folder: `council` has an `agents`
   folder inside it that the skill needs.
   - **Windows:** `%USERPROFILE%\.claude\skills`
   - **Mac:** `~/.claude/skills`
4. Fully quit and reopen Claude Code. Ask *what skills do you have?* and check
   both are listed.

If you are comfortable in a terminal and are inside the unzipped kit folder:

**Windows (PowerShell):**
```powershell
mkdir "$env:USERPROFILE\.claude\skills" -Force
Copy-Item -Recurse -Force claude-config\skills\council, claude-config\skills\the-algorithm "$env:USERPROFILE\.claude\skills\"
```

**Mac (Terminal):**
```bash
mkdir -p ~/.claude/skills
cp -R claude-config/skills/council claude-config/skills/the-algorithm ~/.claude/skills/
```

**Claude desktop app** (Settings, Capabilities, Skills): zip the `council` folder
with its `agents` folder inside, and upload it. Same for `the-algorithm`. The
desktop app may not be able to run the advisors side by side; the skill then
runs them one at a time and says so.

🚨 Only run commands you typed yourself from this page, inside the folder you
downloaded. Never paste a command someone sent you to "install" or "fix" Claude.

---

## Optional: Smart Connections for Obsidian

A free Obsidian plugin that shows, next to whatever note you have open, the
other notes that are about the same thing, even when they use different words.
The kit's `/search` already finds notes by meaning from inside Claude. Smart
Connections is the same idea inside Obsidian, while you read.

1. In Obsidian: **Settings**, **Community plugins**.
2. If it says Restricted mode is on, turn it off.
3. **Browse**, search for **Smart Connections**, **Install**, then **Enable**.
4. Open its panel from the left sidebar. The first time, it reads your whole
   vault to build its index, which can take a few minutes on a big vault.

By default it does that on your own computer. If its settings ever ask for an
API key, you do not need one for the basic related-notes panel.

---

## Optional, for people building software: Archon

**https://github.com/coleam00/Archon** (free, MIT license). An open source tool
for running AI coding work on your code projects, with each job kept in its own
copy of the project so it cannot break what you have.

It is not part of this kit and you do not need it for a second brain. If you
write code with Claude and want to look at it, give your Claude the link and have
it **read the whole thing and check it against your setup first**: what you
already have, what it would add, and what it would change. Install only what it
clears.
