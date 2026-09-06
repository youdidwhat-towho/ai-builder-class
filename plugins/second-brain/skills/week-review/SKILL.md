---
name: week-review
description: The weekly understanding check. Read back what the vault thinks changed this week, ask whether that is right, take a rating, and interview on a low one. Use when the user says "week review", "weekly review", "what did you learn this week", "check your understanding", "is your understanding right", or on the last working day of the week.
---

# Week review

Once a week, the system tells the user what it thinks it learned, and asks
whether it was right.

## Why this exists

A second brain only works if the person keeps working on it, and nobody
busy volunteers to go correct a knowledge base. So the system has to come
to them, and it has to be cheap to answer. Reading a paragraph and saying
"the second one is wrong, here's why" takes ninety seconds. Auditing a
vault takes an afternoon nobody has.

This is also the only mechanism in the kit that catches a **confidently
wrong** vault. The pruning pass finds notes that went stale. This one finds
notes that were never right, which is worse, because they read as current.

## What to do

### 1. Read the week

Everything in `daily/` from the last seven days, plus anything in the
curated folders whose `last_touched:` falls in that window.

### 2. Say what you think changed, in five bullets or fewer

Not a summary of activity. A statement of **understanding**, the kind that
would be wrong if you had it wrong:

```
Here's what I think changed this week:

- The Henderson job is dead. The inspection killed it and you walked
  on Tuesday.
- Marcus Webb went from a name to the person you route anything urgent
  through.
- You decided to stop taking work outside the county.
- Your rule on deposits changed from half up front to a third.

Is that right?
```

Facts they would correct. Not "you worked on deals and made some calls."

### 3. Take the correction

Whatever they fix, write it where it belongs, right then. A rule about how
they work goes in `CLAUDE.md`. A fact about a deal or a person goes in that
note. Then say in one line which file changed.

This is the whole point of the exercise. A correction that gets acknowledged
and not written down is worse than not asking, because now they think the
system knows.

### 4. Ask for a rating

> How useful was I this week, one to ten?

### 5. Interview on anything under seven

Do not thank them and move on. Ask what specifically was bad, and keep it
to two or three questions:

- What did you ask me for that you did not get?
- Where did I make you repeat yourself?
- What did you end up doing by hand that you thought I would handle?

Then write what you learn into `CLAUDE.md` as a rule, in their words, not
yours. A low score with no captured reason is a wasted week.

At seven or above, one line back and let them go.

### 6. Close it out

Append the whole exchange to today's daily note under `## Week review`, so
next week can see whether the same complaint shows up twice. A complaint
that repeats is a system problem, not a bad week.

## The rules

1. **Assert, do not ask them to summarize.** "Here's what I think" gets a
   correction. "How was your week" gets nothing.
2. **Be wrong in public.** If you are not sure about something, say it as a
   belief and let them knock it down. Hedged bullets teach you nothing.
3. **Write corrections immediately.** Before the next question.
4. **Never argue with a low rating.** Ask what happened and write it down.
5. **Five bullets maximum.** This has to be answerable on a phone.
6. **Once a week.** If one already ran in the last five days, say so and
   offer a `checkpoint` instead.
