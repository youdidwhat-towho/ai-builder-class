# Cheat sheet

Keep this open during class. One page, nothing else to memorize.

---

## Say these out loud to Claude

| To do this | Say |
|---|---|
| Set up your vault (do this first) | `let's set up my second brain` |
| Capture anything | `capture this:` then just talk |
| File something messy | `intake this` then paste whatever you have |
| Ask about your own stuff | `what's in my daily note?` |
| Find a note you cannot name | `/search` then say what it was about |
| Save mid-session, keep working | `checkpoint` |
| Save the whole conversation | `tldr` |
| Close out the day | `wrap up` |
| Pick up tomorrow | `/pickup` |
| Check your skills loaded | `what skills do you have?` |
| Check everything is working | `/doctor` |
| Turn down the coaching | `fewer callouts` |
| Get the newest skills | `update my class skills` |

---

## The daily loop

These are not separate tricks. They are one cycle, and the cycle is the whole
system.

```
   /pickup  ──►  capture  ──►  checkpoint  ──►  tldr  ──►  wrap up
   start of day  all day      when it        end of a     end of day
                              matters        conversation
       ▲                                                        │
       └────────────────────────────────────────────────────────┘
                 tomorrow starts where today ended
```

| Step | Say | What it does |
|---|---|---|
| **Start** | `/pickup` | Reads your recent notes and tells you where you left off and what to do today |
| **All day** | `capture this:` | Everything lands in `daily/`, timestamped, no filing decisions |
| **When it matters** | `checkpoint` | Saves mid-session so nothing is lost if you walk away or start fresh |
| **End of a conversation** | `tldr` | Writes that conversation up as its own dated note, with a handoff for next time |
| **End of the day** | `wrap up` | Files the day, updates what you're working on, writes tomorrow's first move |

**Why checkpoint exists:** a long conversation eventually runs out of room and gets
summarized, and detail can fall out. Checkpoint moves what matters into the vault
before that happens. If losing the conversation would cost you something, checkpoint it.

**Why tldr is separate from wrap up:** you may have three real conversations in a day.
Each one gets its own `tldr`. `wrap up` runs once, at the end, over all of them.

**Why the loop matters more than any single command:** `tldr` and `wrap up` are what make
`/pickup` work tomorrow. Skip the writers and the reader has nothing to read. Run them for
a week and you stop starting your day from zero.

---

## The one habit

**Everything goes in `daily/` first.** Every note, every call, every stray thought.

Do not stop to decide where it belongs. That decision is where capture dies.
Filing happens later, and Claude does it.

---

## Your folders

```
second-brain/
  daily/         <- the front door. Everything starts here.
  projects/      <- one file per thing you are trying to finish
  people/        <- one file per real working relationship
  reference/     <- save anything, find it later
  decisions/     <- what you decided and why
  operations/    <- your checklists and processes
  archive/       <- finished, not deleted
  CLAUDE.md      <- your standing instructions
  MEMORY.md      <- decisions waiting on you
```

Whatever you actually do for a living gets its own folders on top of these,
added at install and named the way you say them.

---

## Three things run on their own

| When | What | Where you see it |
|---|---|---|
| 7:30 every morning | The check-in. Reads your vault and says one true thing about it. | The top of today's daily note |
| 10:00 every night | Reflection. Finds what kept coming up this week. | `connections/`, and the greeting next morning |
| 10:20 every night | Backup. Saves everything that changed and pushes it online. | The greeting says whether last night landed |

None of them need you at the keyboard. If any of them stop, the morning
greeting says so in plain words. `/doctor` says why.

---

## Windows vs Mac

Most of this room is on Windows. Only the paths differ, everything else is identical.

| | Windows | Mac |
|---|---|---|
| Home folder | `%USERPROFILE%` | `~` |
| Your vault | `%USERPROFILE%\second-brain` | `~/second-brain` |
| Terminal | PowerShell | Terminal |
| Unzip | right click, **Extract All** | double click |

**If a command fails, say "I'm on Windows" and ask for it again.** Do not translate
paths yourself.

---

## Words you'll hear

| Word | Means |
|---|---|
| **Vault** | The folder. That's it. |
| **Skill** | A note telling Claude how to do one job |
| **CLAUDE.md** | The file it reads first, every session |
| **Hook** | Something that runs automatically, every time |
| **Context** | Its working memory for this conversation |
| **MCP** | A connector to an outside system, like your CRM |
| **Subagent** | A helper that works separately and reports back |

---

## When something breaks

1. **Restart.** Most of the time it is this.
2. Ask `what skills do you have?` If yours are missing, they did not install.
   That is a different problem from a skill that installed but did not fire.
3. Ask `what files are in my daily folder?` If it cannot name a real file, it
   is not connected to your folder and it is guessing.
4. Still stuck, raise your hand. Somebody else has the same question.

---

## Three things worth knowing

**It will be confidently wrong sometimes.** Especially about anything decided on a
phone call and never written down. That is not a malfunction. Your job is knowing
which questions it had no way to answer.

**It gets better as the vault fills.** Week one it is a smart assistant. Month three
it knows things nobody else wrote down.

**The coaching is turned up on purpose.** Colored callouts will fire often for the
first few weeks, because almost everything is new and that is when a lesson sticks.
Say `fewer callouts` any time and it dials back permanently.

**You cannot break it.** Every file is plain text. Nothing here can touch your CRM,
spend your money, or email a client.

---

## Getting new skills later

The kit keeps improving. Say to Claude:

> **update my class skills**

That is the whole thing. No commands, no account, and it never touches your notes.
Restart Claude Code afterward.

🚨 **Never paste a command someone handed you to install or fix Claude.** Fake
"install Claude" ads are everywhere right now and that is exactly how they work.
Real updates never ask you to paste anything.

---

## After today

Do this for one week: capture into `daily/` every day, and run `wrap up` before you
stop. That is the whole habit. Everything else builds on it.
