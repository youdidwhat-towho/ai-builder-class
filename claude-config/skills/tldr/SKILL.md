---
name: tldr
description: Save a summary of this conversation to the vault as a dated session note, so the next session can pick up exactly where this one stopped. Use when the user says "tldr", "save this session", "summarize what we did", "write this up", "save where we got to", or is about to close a long conversation that is worth keeping.
---

# TLDR

Short for *too long, didn't read*. It writes the short version of this
conversation into your vault so tomorrow starts warm.

## Why this exists

A conversation with Claude is not saved anywhere you can search. Close the window
and the reasoning is gone, even though the vault still holds the files you
touched. TLDR is what turns a conversation into a note.

It is also the other half of `/pickup`. Pickup reads session notes. If nothing
writes them, pickup has nothing to read and every day starts from zero.

## How it differs from the other two

| Skill | When | What it writes |
|---|---|---|
| `checkpoint` | Mid session, still working | A few bullets appended to today's daily note |
| `tldr` | End of a conversation | A separate dated session note, with a handoff |
| `end-of-day` | End of the day, all conversations done | Files things, updates `MEMORY.md`, writes tomorrow's first move |

You may run TLDR several times a day, once per real conversation. You run
`end-of-day` once.

## What to do

### 1. Write the note

Save to `daily/YYYY-MM-DD-<short-topic-slug>.md`. A separate file, never appended
to the plain `daily/YYYY-MM-DD.md` capture note. The slug is two to five words
describing the actual subject, so it is findable later: `2026-08-22-henderson-scope-call.md`,
not `2026-08-22-session.md`.

```markdown
---
tags: [session]
date: YYYY-MM-DD
topic: <short topic>
---

# <A real title. What happened, not "Session Summary">

## What happened

Two to five sentences. Plain language. Names, addresses, numbers, dollar figures.

## Decided

- <the decision, and the reason behind it>

## Open

- [ ] <the thing still not done>
- [ ] <who you are waiting on, and since when>

## Handoff

**Keywords:** <five to ten words someone would search for later>

**Start here next time:**
1. <the clearest next action>
2. <second, only if it is obvious>
```

Skip any section that has nothing real in it. An empty heading is worse than a
missing one, because it reads as "nothing happened" instead of "not covered."

### 2. Update `MEMORY.md`

`MEMORY.md` is what Claude reads first every session, so it has to be current or
it actively misleads.

- Add anything now in flight, waiting, or stuck.
- **Delete anything that stopped being true today.** This is the step people skip,
  and stale state is worse than no state.
- Do not paste the session note into it. `MEMORY.md` is current state, three or
  four lines per section. The session note is the record.

### 3. Say what you saved

One or two lines. The file name, and the single most important open item. Not a
recap of the recap.

## The rules

1. **Be specific or do not bother.** "Talked about the Henderson job" is worth
   nothing in three weeks. "Quoted 182k on Henderson, they want 195k, the
   scope gap is the roof, decide by Friday" is worth something.
2. **Write decisions, not activity.** What you concluded, and why. Anyone can
   reconstruct what was discussed. Nobody can reconstruct why you chose.
3. **Record what did not work.** The dead end you already walked down is one of
   the most valuable things in the note, because it stops you walking it twice.
4. **Do not editorialize.** No "great session." If something got dropped, write
   that it got dropped.
5. **Short is fine.** A short conversation gets a short note. Do not pad it to
   look thorough.

## The handoff block is the point

Everything above it is a record. The handoff is the part that does work, because
`/pickup` reads it and hands it back to you. Write it for someone with no memory
of today, which in about a week is you.

The keywords matter more than they look. They are how you find this note again
when you only half remember it.
