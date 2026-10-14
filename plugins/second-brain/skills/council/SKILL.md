---
name: council
description: Gather a council of AI advisors to argue a decision from different sides before you commit. Five lenses by default (Optimist Strategist, Devil's Advocate, Neutral Analyst, Capability Scout, Reliability Engineer), eight with --extended (adds Pragmatist, Edge Case Finder, Reframer). Three modes, standard, debate and premortem. Saves the session to the vault. Use when the user says "council", "convene the council", "get multiple perspectives", "stress test this", "should we do X", "argue this out", "premortem this", or before a big build, a big spend, or any decision that is hard to undo.
---

# The Council

Better decisions come from structured disagreement, not from one confident voice.
The council sends the same question to several advisors at once, each with a
different job, and then you pull their answers into one plan.

The advisors are in `agents/` next to this file. Each one is a plain text role.
Read the ones you need before you launch them.

## The advisors

**Standard council, five, every time:**

| Advisor | File | Job |
|---|---|---|
| Optimist Strategist | `agents/optimist-strategist.md` | Best realistic outcome, and the path to it |
| Devil's Advocate | `agents/devils-advocate.md` | Load-bearing assumptions, blind spots, base rates |
| Neutral Analyst | `agents/neutral-analyst.md` | Facts, trade-offs, what is actually being decided |
| Capability Scout | `agents/capability-scout.md` | What you already have before you build, and real effort estimates (build cost) |
| Reliability Engineer | `agents/reliability-engineer.md` | When it breaks in 60 days, will you know and can you fix it (operate cost) |

**Extended council, add three with `--extended`:**

| Advisor | File | Job |
|---|---|---|
| Pragmatist | `agents/pragmatist.md` | What actually ships with the people and money you have |
| Edge Case Finder | `agents/edge-case-finder.md` | Specific inputs, states and timing that break it quietly |
| The Reframer | `agents/reframer.md` | Is this even the right question |

Use extended for decisions that touch several systems, commit real money or
weeks of time, or cannot easily be undone. If the user did not ask for it and the
decision is one of those, say so in one line and offer it. Then go with what they
pick.

Capability Scout and Reliability Engineer are always in, in every mode. Building
something and running it are different costs. A thing that is cheap to build and
breaks silently every 90 days is not cheap.

## Modes

Read the request:

- Starts with `debate` → **Debate**
- Starts with `premortem` → **Premortem**
- Has `--extended` or "extended" → eight advisors instead of five
- Has `--no-save` → do not write the session file
- Anything else → **Standard**

Extended combines with any mode.

If the user gave no proposal, the thing they were just talking about is the
proposal. Only ask "what should the council look at?" when there is genuinely
nothing in the conversation.

## Step 1: write the brief. This is the step that decides everything

The advisors have no memory and cannot see the vault. They know only what the
brief says. Almost every stale or useless council answer traces back to a thin
brief, not to the advisors.

Before you launch anyone, read the vault for the topic (recent `daily/` notes,
`projects/`, `decisions/`, and any earlier council session on the same topic) and
write a brief with these parts:

| Part | Why |
|---|---|
| **The proposal** | The idea, plan or decision, in the user's own words where you can |
| **What changed since last time** | Otherwise they re-argue settled points and re-raise fixed problems |
| **What is already committed or underway** | So nobody recommends work that is already happening or already paid for |
| **Timeline and appetite** | A real number, or "the user will set it". Never leave it blank. A blank gets filled with a generic guess |
| **Who does the work** | The user, Claude, a hire, a helper agent, an automation. Most "limits" are really assumptions about this |
| **What it is for** | The business goal it feeds. A correct answer aimed at the wrong goal is wrong |
| **Earlier sessions** | Link them. Name what was settled |
| **What you already have** | Installed skills (list the skills folder), connected tools, existing scripts or automations related to this. Capability Scout needs this to do its job |

If a part is genuinely unknown and matters, ask the user one short question. If
it can be found in the vault, find it.

## Step 2: launch the advisors, all at once

Launch every advisor in **one message**, in parallel, so none of them sees
another's answer. Independent first answers are the point.

For each advisor, start a helper agent (the general-purpose type is fine). Its
prompt is the full text of that advisor's file from `agents/`, then this:

```
COUNCIL DELIBERATION

{the brief from Step 1}

HOW TO THINK:
0. Define success in outcome-only terms first: what the person affected sees,
   what is guaranteed, what number moves. If the method can be read off your
   definition, rewrite it. Also say what they see when it FAILS. A wrong answer
   that looks right is a critical risk.
1. Work backward from that outcome. What must be true, in what order? What is
   the simplest path from here to there?
2. Judge the plan against that path. If there is a better way, say so.
Start simple. Add complexity only to close a real gap.

ASSUMPTION CHECK: before you state any limit, ceiling or constraint, say what it
assumes about who does the work. Hiring, automation or a helper agent breaks most
of them.

NO PRE-FILTERING: do not shrink or soften a recommendation because of a guess
about the user's time, energy, money or capacity. Give the full honest version.
Use only constraints the brief actually states. The user decides what fits.

Give confidence levels (0-100%) on your key claims. Say where you expect to agree
or disagree with the other advisors. Follow your output structure. End with
exactly one CONCLUSION sentence and one CRITICAL QUESTION for the decision maker.
```

A faster, cheaper model is fine for the advisors. Keep the synthesis on the main
session.

**No helper agents available** (some apps do not have them): run each advisor
yourself, one at a time, writing each report in full before reading the next
role. Say in the synthesis that the reports were not independent.

If an advisor fails to return, say which one, synthesize from the rest, and lower
your confidence.

## Step 3: synthesize

Three of the eight advisors exist to find problems (Devil's Advocate, Edge Case
Finder, Reliability Engineer), so the raw reports lean toward risk by design.
Passing them through unfiltered misrepresents the council. Compress on the way
out:

- **Lead with what changes about the plan,** not with the list of risks.
- **One line per risk, ranked.** A risk that changes no decision goes in the
  session file only.
- **Separate design problems from hygiene.** A design problem needs something
  built. Hygiene is just doing it right (do not paste passwords into chat). Only
  design problems get discussion.
- **If the user answers a risk with their own fix, they understood it.** Take
  their framing and drop the topic.

The full reports still go in the session file. Compression is about what you
show, not what you keep.

Synthesis layout:

```
COUNCIL SYNTHESIS
Proposal: ...
Date: YYYY-MM-DD
Mode: Standard | Extended | Debate | Premortem

WHAT CHANGES ABOUT THE PLAN
- ...

CONSENSUS (all advisors agree)
- ...

DIVERGENCE (real disagreements)
- topic: Optimist says X, Devil's Advocate says Y, Analyst says Z

BUILD COST (Capability Scout)
- Already have: existing skills, tools, scripts that cover part of this
- Extend or build: extend X, or genuinely new
- Effort, translated: generic hours → realistic, split into human-only work,
  work Claude can do fast, and waiting-to-see-it-work time
- Estimates other advisors got wrong because they assumed no AI help
- True gaps

OPERATE COST (Reliability Engineer)
- How each new piece fails: loud, medium, or quiet
- Logins and keys that expire, and whether that fails loud or quiet
- Time to fix when it breaks on a busy Tuesday
- New things to keep track of: +N or -N
- Who else could fix it
- NOT SHIPPABLE flags: quiet failure + slow fix + only one person can fix it.
  Either add a day-one alert or say plainly the user is accepting a silent
  failure risk

CONFIDENCE SPREAD
| Claim | Optimist | Devil's Adv. | Analyst | ... | Spread |
Over 30 points = investigate further. 15 to 30 = weigh carefully. Under 15 = near
consensus.

RECOMMENDATION
...

NEXT 72 HOURS
1. First action, owner, by when
2. Decision needed before going further
3. How you will know it is working
```

Extended adds, after OPERATE COST:

```
EXECUTION REALITY (Pragmatist): what ships with what you have, the smallest
version that delivers, the upkeep
CRITICAL EDGE CASES (Edge Case Finder): scenario → consequence → defense
FRAME CHECK (Reframer): proceed as stated, or reframe to a better question;
assumptions nobody examined
```

**Tiebreaker:** when two or more advisors dissent from the majority, list it under
"Ambiguous, your call" instead of picking a side. On execution questions, the
Pragmatist and Edge Case Finder carry extra weight.

The council advises. The user decides. Never present the synthesis as settled.

## Step 4: the Algorithm cut, only when the council recommends building something

Councils add. The Algorithm subtracts.

**Run it when** the synthesis ends in work to do: build this, a plan, a sequence
of moves. **Skip it** for yes or no questions and pick-one-of-these questions,
since there is no list to cut.

1. Number every recommendation from the synthesis (and from the reports, where
   the synthesis folded them in).
2. Run the `the-algorithm` skill on that list. Each item: survives, merged into a
   survivor, moved to a later checklist, shrunk, or cut, with a one-line reason.
3. Build the plan from the survivors only.
4. End with one line: did the cut make the plan better, yes or no, and why.

Show the user the survivor plan first, then the cut list.

## Step 5: save the session

Unless `--no-save`, write the whole thing to
`decisions/YYYY-MM-DD-council-<short-topic>.md` in the vault:

```markdown
---
last_touched: YYYY-MM-DD
type: council
mode: standard | extended | debate | premortem
---

# Council: <topic>

## The brief
<the full brief from Step 1>

## Optimist Strategist
<full report>

## Devil's Advocate
...
(one section per advisor that ran)

## Synthesis
<from Step 3>

## Algorithm cut
<only if Step 4 ran: recommendation | what happened | why, the survivor plan,
the one-line verdict>
```

Add a one-line pointer in today's `daily/` note so the session can be found.

## Debate mode

`council debate <topic>`

1. Look in `decisions/` for a recent council on this topic. If there is none, run
   Standard first.
2. Relaunch every advisor, in parallel, with a short summary of every other
   advisor's position, and this task:

```
COUNCIL DEBATE
Topic: ...
Positions so far: <one short summary per advisor>

1. Name the strongest claims from the other advisors.
2. Challenge specific ones: "To <advisor> on '<claim>': <challenge>"
3. Point out gaps in their reasoning.
4. Defend your position against the likely pushback.
5. Concede what is right.
6. End with REVISED confidence levels.
```

3. The Neutral Analyst's debate answer is the referee. You add which positions
   survived, which got weaker, what the debate showed that the first round did
   not, and the updated recommendation.
4. Append to the existing session file under `## Debate`.

## Premortem mode

`council premortem <project or decision>`

Tell every advisor:

```
PREMORTEM
It is 18 months from now. <project> failed completely.
Write the post-mortem from your role: why it failed. Concrete failure modes, not
vague worries. End with how likely this failure is (0-100%) and the single action
that would most prevent it.
```

Then synthesize:

```
PREMORTEM SYNTHESIS
FAILURE MODES, most likely first: what, how likely, raised by, prevention
EARLY WARNING SIGNS: signal → which failure it points to
PREVENTION PRIORITIES: ranked
VERDICT: overall risk low / moderate / high, and the most dangerous blind spot
```

Save as `decisions/YYYY-MM-DD-premortem-<short-topic>.md`.

## Mistakes to avoid

| Wrong | Right |
|---|---|
| Launching advisors one after another | All in one message, so first answers stay independent |
| A one-line brief | The full Step 1 brief. Thin brief, generic answers |
| Showing five raw reports | Always synthesize, lead with what changes |
| Relaying every risk as a big deal | One line each, ranked, design problems only get discussion |
| Using the council to look something up | The council judges a proposal. Research is a different job |
| Debate with no first round | Run Standard first |
| Treating the result as the decision | The council is one input. The user decides |
