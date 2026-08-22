# Cheat sheet

Keep this open during class. One page, nothing else to memorize.

---

## Say these out loud to Claude

| To do this | Say |
|---|---|
| Set up your vault (do this first) | `let's set up my second brain` |
| Capture anything | `capture this:` then just talk |
| Add a deal | `new deal` then paste whatever you have |
| Ask about your own stuff | `what's in my daily note?` |
| Run comps | `run comps on 1247 Oak Street` |
| Save mid-session, keep working | `checkpoint` |
| Close out the day | `wrap up` |
| Pick up tomorrow | `/pickup` |
| Check your skills loaded | `what skills do you have?` |

---

## The daily loop

These four are not separate tricks. They are one cycle, and the cycle is the whole
system.

```
   /pickup  ────────►  capture  ────────►  checkpoint  ────────►  wrap up
   start of day        all day long        when it matters        end of day
       ▲                                                              │
       └──────────────────────────────────────────────────────────────┘
                     tomorrow starts where today ended
```

| Step | Say | What it does |
|---|---|---|
| **Start** | `/pickup` | Reads your recent notes and tells you where you left off and what to do today |
| **All day** | `capture this:` | Everything lands in `daily/`, timestamped, no filing decisions |
| **When it matters** | `checkpoint` | Saves mid-session so nothing is lost if you walk away or start fresh |
| **End** | `wrap up` | Files the day, updates what you're working on, writes tomorrow's first move |

**Why checkpoint exists:** a long conversation eventually runs out of room and gets
summarized, and detail can fall out. Checkpoint moves what matters into the vault
before that happens. If losing the conversation would cost you something, checkpoint it.

**Why the loop matters more than any single command:** `wrap up` is what makes `/pickup`
work tomorrow. Skip the first and the second has nothing to read. Run both for a week
and you stop starting your day from zero.

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
  deals/         <- one file per live deal
  contacts/      <- people
  properties/    <- one card per property, kept forever
  reference/     <- save anything, find it later
  decisions/     <- what you decided and why
  operations/    <- your checklists and processes
  CLAUDE.md      <- your standing instructions
  MEMORY.md      <- what you're working on right now
```

---

## Mac vs Windows

Only the paths differ. Everything else is identical.

| | Mac | Windows |
|---|---|---|
| Home folder | `~` | `%USERPROFILE%` |
| Your vault | `~/second-brain` | `%USERPROFILE%\second-brain` |
| Terminal | Terminal | PowerShell |
| Unzip | double click | right click, **Extract All** |

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

**You cannot break it.** Every file is plain text. Nothing here can touch your CRM,
spend your money, or email a client.

---

## After today

Do this for one week: capture into `daily/` every day, and run `wrap up` before you
stop. That is the whole habit. Everything else builds on it.
