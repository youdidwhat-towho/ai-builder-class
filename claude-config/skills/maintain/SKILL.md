---
name: maintain
description: The pruning pass. Move finished and stale notes out of active memory into the archive so searches stay sharp. Use when the user says "maintain", "prune", "clean up the vault", "what's gone stale", "archive old notes", when the heartbeat says a pass is due, or roughly every two weeks.
---

# Maintain

The pass that keeps the vault from turning into a pile. Run it every two weeks.

## Why this exists

A second brain does not fail on day one. It fails in month six, when every
search returns four notes that were true in March and one that is true now,
and the user stops trusting the answers.

The fix is not deleting things. It is **demotion**. A note that is finished
moves to `archive/`, where it is still searchable when asked for by name or
by history, but no longer shows up when the user asks what they are working
on. Two retrieval modes instead of one.

**Nothing here is automatic.** This skill proposes; the user decides. A
system that quietly moved their notes would be worse than one that never
pruned at all.

## What to do

### 1. Survey

Look at `projects/`, `people/`, `decisions/`, `operations/`, and
`reference/`, plus any folders this person added for their own work. For
each note, work out how long since it was last genuinely touched.

Prefer a `last_touched:` line in the frontmatter. Fall back to the file's
modification date only when there is nothing else, and **say which one you
used**. Modification dates lie: a sync, a bulk rename, or any script that
walks the folder resets them on everything at once, and then every note
looks freshly worked.

Never survey `daily/`. A dated note is not stale when it stops being
touched, it is finished. The daily log is the record of what happened and
it is never pruned. Same for `connections/`, which is written by the
reflection pass rather than by the user.

### 2. Sort what you found into three piles

| Pile | What it means | What to propose |
|---|---|---|
| **Done** | The thing it describes has concluded. Project shipped, decision made and acted on, trip taken, job finished. | Archive it. |
| **Cold** | Nothing has concluded, it just stopped moving. | Ask: still live, or dead? |
| **Current** | Touched recently, or it is a standing reference that does not age. | Leave it alone. |

Elapsed time is the strongest signal for the Done pile and it is often
readable straight off the note. A note saying the handover is March 14th,
read in September, is describing something finished. Say so.

### 3. Propose, in one screen

Group by pile. Name the note, its age, and the one-line reason. Something like:

```
Done, ready to archive (4)
  henderson-job        142d   note says delivered and invoiced 3/14
  q1-marketing-push     97d   quarter ended

Cold, need a call from you (2)
  marcus-webb           64d   last contact was an unanswered text
  vendor-consolidation  51d   started, no entry since

Current (31) — leaving alone
```

Then one question: which of these should move?

### 4. Move only what they approve

Archive by moving the file into `archive/<folder>/`, preserving the folder
name. `projects/henderson-job.md` becomes
`archive/projects/henderson-job.md`.

Add one line at the bottom of each archived note before moving it:

```markdown

*Archived YYYY-MM-DD: <one line on why>*
```

Then log the pass to `LEDGER.md` in a single line with the count, and tell
them what moved in one sentence.

## The rules

1. **Never delete.** Archive is the only outcome. If they want something
   gone they can delete it themselves, and they will not ask often.
2. **Never move without a yes.** Not even the obvious ones.
3. **Cold is a question, not a verdict.** "This hasn't moved in 60 days" is
   an observation. Whether it is actually dead is theirs to say.
4. **Do not prune `daily/`.** Ever. It is the capture record.
5. **Say which signal you used.** If most notes had no `last_touched:` and
   you fell back to modification dates, lead with that. The report is only
   as good as the signal under it.
6. **One screen.** If forty things are stale, show the worst ten and say
   there are thirty more.

## Starting a note's clock

When a note is created or meaningfully updated, put today's date in its
frontmatter:

```yaml
last_touched: 2026-09-05
```

This is what makes the next pass honest. Without it, this skill is reading
the filesystem instead of reading their work.

## Searching after a prune

Once `archive/` has anything in it, the default search is active memory
only. Search the archive too when the user asks about the past in so many
words: "have I ever", "what did I do with", "back when", "all my", or when
they name something you cannot find in active memory. Say which one you
searched.
