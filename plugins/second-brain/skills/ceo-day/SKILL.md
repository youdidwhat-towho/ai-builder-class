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

## Step 0: make this session the CEO (do this first, every time)

Run these before anything else. They are not optional and not "if cmux is available later". The CEO has to be easy to find all day.

If `cmux` is not found, use the full path: `/Applications/cmux.app/Contents/Resources/bin/cmux`.

```
cmux workspace-action --action rename --title "👔 CEO · <Model> <effort>"
cmux workspace-action --action set-color --color Green
cmux workspace-action --action set-description --description "CEO session for <date>. Lanes report on daily/<date>-board.md"
cmux workspace-action --action pin
cmux workspace-action --action move-top
cmux set-status mode "CEO"
```

Then check it worked: `cmux list-workspaces` should show the CEO workspace first with its name. If a command fails, say which one and fix it before continuing. Do not skip ahead.

Then create the board note `daily/<date>-board.md` and put one line at the top: `CEO session started <time>`.

## Morning: set up the day (CEO)

1. Read yesterday's daily note and `MEMORY.md` for what is open.
2. Ask the user for the day's list in one message. Do not ask follow-ups until the first list is in.
3. Sort it into lanes. One job per lane. Anything that sends to an outside person, moves money, or deletes something is marked **needs you**.
4. Write each lane onto the board note: a name (2 to 3 words), the job in one line, the first step, and `Status:`.
5. Show the user the board and the lane list. Start the lanes only after a yes.

## Starting a lane

Each lane is its own cmux workspace running its own Claude. The CEO opens them:

```
cmux new-workspace --name "🔹 <slug> · <Model> <effort>" --cwd ~/second-brain --focus false --command "claude --model <model>"
cmux workspace-action --action set-color --color Blue --workspace <the new workspace>
cmux set-status mode "YOU" --workspace <the new workspace>
```

Give each lane its job as the first message, with: the one-line job, the board note path, and "put your line on the board first, then work."

The lane's first act is its board line: `- [ ] **<slug>** job in one line` with sub-lines `Claimed: <date and time>`, `Parent: CEO`, `Status:`. Lanes edit the board by their own slug, never by line number, because other lanes edit the same file.

If cmux is truly not installed, open a new Terminal window per lane and run `claude` in the vault folder, and say so on the board.

## The waiting line (the whole point)

When a lane hits something only the user can decide, it does not stop the day and it does not guess. It:

1. Writes one line on its board entry: `WAITING ON YOU: <the exact question, with a), b), c) options if it is a pick>`.
2. Turns its workspace red (`cmux workspace-action --action set-color --color Red`) and sets `cmux set-status mode "WAITING"` so it is visible.
3. Keeps working on everything else in its lane.

When the user answers (to the CEO), the CEO passes the answer to the lane, the lane clears the line, turns back to Blue, and sets status back to YOU.

## When a lane finishes

A lane that is done or fully parked closes itself out:

1. Update its board line: `[x]` if done, or leave `[ ]` with its WAITING line if parked. Set `Status:` to DONE or PARKED.
2. Set the workspace color to Green (done) or leave Red (parked on you): `cmux workspace-action --action set-color --color Green`.
3. Set `cmux set-status mode "DONE"` (or `"PARKED"`).
4. Say as the last line: "Nothing left to do here. You may close out."

## Icons

Pick the icon for the kind of work when you name the lane: 🏠 rentals, 💵 lending and money, 🌐 pages and sites, 🧹 cleanup, 🔧 installs and fixes, 🫵 anything that is mostly waiting on you. Use 🔹 only if nothing fits.

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
4. Unpin the CEO workspace (`cmux workspace-action --action unpin`) and set its color to Gray.
5. Say it plainly: "Nothing left to do here. You may close out."

## Rules

- The CEO does not do lane work. If the CEO starts doing the work, hand it to a lane.
- One job per lane. If a lane grows a second job, split it.
- Lanes report on the board, not by messaging the CEO. The CEO reads the board.
- Your guard stays on. This skill never changes permissions or safety settings.
