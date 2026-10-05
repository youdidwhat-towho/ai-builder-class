---
name: ceo-day
description: Run the day as a CEO session. One thin "CEO" Claude session plans the day, hands work to separate lane sessions, collects what each lane is waiting on you for, and closes last. Use when the user says "run the day", "CEO session", "fan this out", "open lanes", "what's waiting on me", or starts the morning with more than three things to get done.
---

# CEO day

One session is the CEO. It stays thin: it plans, hands out work, collects questions, and closes the day. Each piece of work runs in its own lane, a separate Claude session. You answer questions in one place instead of tracking ten windows.

## The shape

1. **CEO session** = the first session of the day. Open it all day. It does not do the work itself.
2. **Lanes** = one session per job (a rental, a loan, a page, a cleanup). A lane can open its own helper lanes.
3. **The board** = one note, `daily/YYYY-MM-DD-board.md`. One line per lane. This is the only place you look.
4. **The CEO closes last.** Lanes finish and stop; the CEO writes the day note after the last lane is done or parked.

## Morning: set up the day (CEO)

1. Read yesterday's daily note and `MEMORY.md` for what is open.
2. Ask the user for the day's list in one message. Do not ask follow-ups until the first list is in.
3. Sort it into lanes. One job per lane. Anything that sends to an outside person, moves money, or deletes something is marked **needs you**.
4. Write the board note: for each lane, a name (2 to 3 words), the job in one line, the first step, and `Status:`.
5. Show the user the board and the lane list. Start the lanes only after a yes.

## Starting a lane

Each lane gets its own session, and its first act is to put its line on the board:

- Name the lane with a short slug (`rental-insurance`, `grant-page`).
- Add a line to the board: `- [ ] **<slug>** job in one line` with sub-lines `Claimed: <date and time>`, `Parent: CEO`, `Status:`.
- If cmux is available, open it as a cmux workspace named for the slug. Otherwise open a new Terminal window and run `claude` in the vault folder.
- Edit the board by the lane's own tag, never by line number, because other lanes edit the same file.

## The waiting line (the whole point)

When a lane hits something only the user can decide, it does not stop the day and it does not guess. It:

1. Writes one line on its board entry: `WAITING ON YOU: <the exact question, with a), b), c) options if it is a pick>`.
2. Turns its workspace red (cmux: `cmux workspace-action --action set-color --color Red`) so it is visible.
3. Keeps working on everything else in its lane.

When the user answers (to the CEO), the CEO passes the answer to the lane, the lane clears the line and turns back to its color.

## What always waits on the user

Park it, say so on the board, keep going on the rest:
- Sending anything to an outside person (tenant, buyer, lender, agent, vendor, anyone who is not you or your team)
- Anything that moves money or signs something
- Deleting files or records
- Anything that needs a password, a code, or your phone

## Model choice per lane

Use the strongest model for judgment work (a lending decision, a contract read). Use a lighter one for lookups, cleanup, and installs. Many lanes at once use up the plan's usage window faster, so match the model to the job.

## Evening: close the day (CEO)

1. Read the board. Every lane should be DONE or PARKED with its WAITING line.
2. Write the day note: what got done, what is parked and why, and "Start here tomorrow."
3. Mark the board lines `[x]` for done lanes.
4. Say it plainly: "Nothing left to do here. You may close out."

## Rules

- The CEO does not do lane work. If the CEO starts doing the work, hand it to a lane.
- One job per lane. If a lane grows a second job, split it.
- Lanes report on the board, not by messaging the CEO. The CEO reads the board.
- Your guard stays on. This skill never changes permissions or safety settings.
