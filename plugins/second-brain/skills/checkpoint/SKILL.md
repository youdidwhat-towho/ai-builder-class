---
name: checkpoint
description: Save where you are in the middle of a session without ending it. Use when the user says "checkpoint", "save where we are", "save this", "I need to step away", "before I forget", "I have to go", or when the conversation has run long enough that starting fresh would be safer than continuing.
---

# Checkpoint

A mid-session save. Not the end of the day, just a marker so nothing is lost if you
walk away, close the laptop, or start a fresh conversation.

## Why this exists

Claude's memory for a single conversation is finite. A long session eventually gets
summarized to make room, and detail can fall out when that happens. A checkpoint moves
what matters out of the conversation and into the vault, where it is permanent.

The rule of thumb: **if losing this conversation would cost you something, checkpoint
it.**

## What to do

Append to today's file in `daily/`:

```markdown
## HH:MM checkpoint
- <what got done or decided since the last one>
- <anything still open>
- <the next thing to do>
```

Three to six short bullets. What happened, what is open, what is next. No narrative.

Then say one line confirming it saved, and keep working. A checkpoint does not end the
session.

## The rules

1. **Do not summarize the whole day.** Only what has happened since the last checkpoint,
   or since the session started.
2. **Write decisions, not activity.** "Decided to pass on Henderson, scope
   plus timeline" beats "discussed Henderson."
3. **Never end the session.** To write the whole conversation up when it is actually
   over, that is `tldr`. To close out the day across every conversation, that is
   `end-of-day`.
4. **Keep it fast.** No questions, no confirmation prompts. They are mid-thought.

## When to suggest one without being asked

- They say they have to leave, take a call, or step away
- The conversation has gone on long and covered a lot of ground
- They just made a decision worth keeping

Offer it in one line. Do not insist.
